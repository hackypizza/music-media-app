package com.example.personalmediahub;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;
import fi.iki.elonen.NanoHTTPD;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.InputStream;
import java.io.IOException;

/**
 * NanoHTTPD Server serving HTML dashboard and streaming endpoints for audio, photo, and video.
 */
public class MediaServer extends NanoHTTPD {
    private static final String TAG = "MediaServer";
    private final Context context;

    public MediaServer(Context context, int port) {
        super(port);
        this.context = context.getApplicationContext();
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Method method = session.getMethod();

        if (Method.GET.equals(method)) {
            if ("/".equals(uri) || "/index.html".equals(uri)) {
                return newFixedLengthResponse(Response.Status.OK, "text/html; charset=UTF-8", getDashboardHtml());
            } else if ("/api/audio".equals(uri)) {
                return newFixedLengthResponse(Response.Status.OK, "application/json", getAudioJson().toString());
            } else if ("/api/images".equals(uri)) {
                return newFixedLengthResponse(Response.Status.OK, "application/json", getImagesJson().toString());
            } else if ("/api/videos".equals(uri)) {
                return newFixedLengthResponse(Response.Status.OK, "application/json", getVideosJson().toString());
            } else if (uri.startsWith("/stream/audio/")) {
                long id = Long.parseLong(uri.replace("/stream/audio/", ""));
                return streamMedia(ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id), "audio/mpeg");
            } else if (uri.startsWith("/stream/image/")) {
                long id = Long.parseLong(uri.replace("/stream/image/", ""));
                return streamMedia(ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id), "image/jpeg");
            } else if (uri.startsWith("/stream/video/")) {
                long id = Long.parseLong(uri.replace("/stream/video/", ""));
                return streamMedia(ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id), "video/mp4");
            }
        }
        return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
    }

    private Response streamMedia(Uri contentUri, String mimeType) {
        try {
            ContentResolver resolver = context.getContentResolver();
            InputStream inputStream = resolver.openInputStream(contentUri);
            if (inputStream != null) {
                return newChunkedResponse(Response.Status.OK, mimeType, inputStream);
            }
        } catch (Exception e) {
            Log.e(TAG, "Stream error: " + e.getMessage());
        }
        return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Media file not found");
    }

    private JSONArray getAudioJson() {
        JSONArray array = new JSONArray();
        ContentResolver cr = context.getContentResolver();
        Uri collection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
                : MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;

        String[] projection = {
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.DURATION
        };

        try (Cursor c = cr.query(collection, projection, MediaStore.Audio.Media.IS_MUSIC + "!=0", null, MediaStore.Audio.Media.TITLE + " ASC")) {
            if (c != null) {
                int idCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int titleCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE);
                int artistCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST);
                int durCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION);

                while (c.moveToNext()) {
                    long id = c.getLong(idCol);
                    JSONObject obj = new JSONObject();
                    obj.put("id", id);
                    obj.put("title", c.getString(titleCol));
                    obj.put("artist", c.getString(artistCol));
                    obj.put("duration", c.getLong(durCol));
                    obj.put("streamUrl", "/stream/audio/" + id);
                    array.put(obj);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Query audio error", e);
        }
        return array;
    }

    private JSONArray getImagesJson() {
        JSONArray array = new JSONArray();
        ContentResolver cr = context.getContentResolver();
        Uri collection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
                : MediaStore.Images.Media.EXTERNAL_CONTENT_URI;

        String[] projection = {
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
                MediaStore.Images.Media.SIZE
        };

        try (Cursor c = cr.query(collection, projection, null, null, MediaStore.Images.Media.DATE_ADDED + " DESC")) {
            if (c != null) {
                int idCol = c.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
                int nameCol = c.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
                int sizeCol = c.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE);

                while (c.moveToNext()) {
                    long id = c.getLong(idCol);
                    JSONObject obj = new JSONObject();
                    obj.put("id", id);
                    obj.put("name", c.getString(nameCol));
                    obj.put("size", c.getLong(sizeCol));
                    obj.put("streamUrl", "/stream/image/" + id);
                    array.put(obj);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Query images error", e);
        }
        return array;
    }

    private JSONArray getVideosJson() {
        JSONArray array = new JSONArray();
        ContentResolver cr = context.getContentResolver();
        Uri collection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
                : MediaStore.Video.Media.EXTERNAL_CONTENT_URI;

        String[] projection = {
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.DISPLAY_NAME,
                MediaStore.Video.Media.DURATION
        };

        try (Cursor c = cr.query(collection, projection, null, null, MediaStore.Video.Media.DATE_ADDED + " DESC")) {
            if (c != null) {
                int idCol = c.getColumnIndexOrThrow(MediaStore.Video.Media._ID);
                int nameCol = c.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME);
                int durCol = c.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION);

                while (c.moveToNext()) {
                    long id = c.getLong(idCol);
                    JSONObject obj = new JSONObject();
                    obj.put("id", id);
                    obj.put("name", c.getString(nameCol));
                    obj.put("duration", c.getLong(durCol));
                    obj.put("streamUrl", "/stream/video/" + id);
                    array.put(obj);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Query videos error", e);
        }
        return array;
    }

    private String getDashboardHtml() {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Personal Media Hub</title>\n" +
                "  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css\">\n" +
                "  <style>\n" +
                "    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }\n" +
                "    .card { background-color: #1e293b; border-color: #334155; color: #f8fafc; }\n" +
                "    .nav-tabs .nav-link { color: #94a3b8; }\n" +
                "    .nav-tabs .nav-link.active { background-color: #1e293b; color: #38bdf8; border-color: #334155 #334155 transparent; }\n" +
                "    .media-card { transition: transform 0.2s; cursor: pointer; }\n" +
                "    .media-card:hover { transform: translateY(-4px); }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body class=\"p-4\">\n" +
                "  <div class=\"container\">\n" +
                "    <header class=\"d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary\">\n" +
                "      <div>\n" +
                "        <h2 class=\"fw-bold text-info mb-0\">📡 Personal Media Hub</h2>\n" +
                "        <p class=\"text-secondary mb-0\">Local Wi-Fi Streaming Server</p>\n" +
                "      </div>\n" +
                "      <span class=\"badge bg-success px-3 py-2\">Online</span>\n" +
                "    </header>\n" +
                "\n" +
                "    <ul class=\"nav nav-tabs mb-4\" id=\"mediaTabs\" role=\"tablist\">\n" +
                "      <li class=\"nav-item\"><button class=\"nav-link active\" data-bs-target=\"#audioTab\" data-bs-toggle=\"tab\">🎵 Music</button></li>\n" +
                "      <li class=\"nav-item\"><button class=\"nav-link\" data-bs-target=\"#imagesTab\" data-bs-toggle=\"tab\">🖼 Photos</button></li>\n" +
                "      <li class=\"nav-item\"><button class=\"nav-link\" data-bs-target=\"#videosTab\" data-bs-toggle=\"tab\">🎬 Videos</button></li>\n" +
                "    </ul>\n" +
                "\n" +
                "    <div class=\"tab-content\">\n" +
                "      <div class=\"tab-pane fade show active\" id=\"audioTab\">\n" +
                "        <div id=\"audioList\" class=\"list-group\"></div>\n" +
                "      </div>\n" +
                "      <div class=\"tab-pane fade\" id=\"imagesTab\">\n" +
                "        <div id=\"imageList\" class=\"row g-3\"></div>\n" +
                "      </div>\n" +
                "      <div class=\"tab-pane fade\" id=\"videosTab\">\n" +
                "        <div id=\"videoList\" class=\"row g-3\"></div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js\"></script>\n" +
                "  <script>\n" +
                "    fetch('/api/audio').then(r=>r.json()).then(data=>{\n" +
                "      const el = document.getElementById('audioList');\n" +
                "      el.innerHTML = data.map(item => `\n" +
                "        <div class=\"list-group-item card mb-2 p-3 d-flex flex-row justify-content-between align-items-center\">\n" +
                "          <div><h6 class=\"mb-1\">${item.title}</h6><small class=\"text-secondary\">${item.artist}</small></div>\n" +
                "          <audio controls src=\"${item.streamUrl}\" class=\"ms-3\"></audio>\n" +
                "        </div>\n" +
                "      `).join('') || '<p class=\"text-secondary\">No audio found</p>';\n" +
                "    });\n" +
                "    fetch('/api/images').then(r=>r.json()).then(data=>{\n" +
                "      const el = document.getElementById('imageList');\n" +
                "      el.innerHTML = data.map(item => `\n" +
                "        <div class=\"col-6 col-md-3\">\n" +
                "          <div class=\"card p-1\">\n" +
                "            <img src=\"${item.streamUrl}\" class=\"img-fluid rounded\" style=\"height:180px;object-fit:cover;\" loading=\"lazy\" />\n" +
                "            <small class=\"p-1 text-truncate\">${item.name}</small>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "      `).join('') || '<p class=\"text-secondary\">No photos found</p>';\n" +
                "    });\n" +
                "    fetch('/api/videos').then(r=>r.json()).then(data=>{\n" +
                "      const el = document.getElementById('videoList');\n" +
                "      el.innerHTML = data.map(item => `\n" +
                "        <div class=\"col-12 col-md-6\">\n" +
                "          <div class=\"card p-2\">\n" +
                "            <video controls src=\"${item.streamUrl}\" class=\"w-100 rounded mb-2\" style=\"max-height:260px;\"></video>\n" +
                "            <h6 class=\"text-truncate mb-0\">${item.name}</h6>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "      `).join('') || '<p class=\"text-secondary\">No videos found</p>';\n" +
                "    });\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }
}
