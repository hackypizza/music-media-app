package com.example.personalmediahub;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import java.io.IOException;

/**
 * BackgroundMediaService operates as a Foreground Service for:
 * 1. Background in-app audio playback via MediaPlayer with notification controls
 * 2. Silent background NanoHTTPD HTTP streaming server on port 8080
 */
public class BackgroundMediaService extends Service implements MediaPlayer.OnCompletionListener, MediaPlayer.OnErrorListener {
    private static final String TAG = "BackgroundMediaService";
    public static final String CHANNEL_ID = "MediaHubServiceChannel";
    public static final int NOTIFICATION_ID = 101;

    // Notification action constants
    public static final String ACTION_TOGGLE_PLAY = "com.example.personalmediahub.ACTION_TOGGLE_PLAY";
    public static final String ACTION_NEXT = "com.example.personalmediahub.ACTION_NEXT";
    public static final String ACTION_PREV = "com.example.personalmediahub.ACTION_PREV";
    public static final String ACTION_STOP = "com.example.personalmediahub.ACTION_STOP";

    private final IBinder binder = new LocalBinder();
    private MediaPlayer mediaPlayer;
    private MediaServer mediaServer;
    private boolean isServerRunning = false;

    // Track playback state
    private String currentTitle = "No track playing";
    private String currentArtist = "Unknown Artist";
    private Uri currentTrackUri = null;

    public interface PlaybackStateListener {
        void onTrackChanged(String title, String artist, int durationMs);
        void onPlaybackStateChanged(boolean isPlaying);
        void onTrackCompleted();
    }

    private PlaybackStateListener stateListener;

    public class LocalBinder extends Binder {
        public BackgroundMediaService getService() {
            return BackgroundMediaService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        initMediaPlayer();
        startHiddenMediaServer();
    }

    private void initMediaPlayer() {
        if (mediaPlayer == null) {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build()
            );
            mediaPlayer.setOnCompletionListener(this);
            mediaPlayer.setOnErrorListener(this);
        }
    }

    private void startHiddenMediaServer() {
        if (!isServerRunning) {
            try {
                mediaServer = new MediaServer(getApplicationContext(), 8080);
                mediaServer.start();
                isServerRunning = true;
                Log.i(TAG, "Hidden background MediaServer started on port 8080");
            } catch (IOException e) {
                Log.e(TAG, "Failed to start MediaServer: " + e.getMessage());
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            switch (intent.getAction()) {
                case ACTION_TOGGLE_PLAY:
                    togglePlayPause();
                    break;
                case ACTION_NEXT:
                    if (stateListener != null) stateListener.onTrackCompleted();
                    break;
                case ACTION_PREV:
                    seekTo(0);
                    break;
                case ACTION_STOP:
                    stopSelf();
                    break;
            }
        }

        Notification notification = buildNotification(currentTitle, currentArtist, isPlaying());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        return START_STICKY;
    }

    public void playTrack(Uri uri, String title, String artist) {
        try {
            this.currentTrackUri = uri;
            this.currentTitle = title;
            this.currentArtist = artist;

            mediaPlayer.reset();
            mediaPlayer.setDataSource(getApplicationContext(), uri);
            mediaPlayer.prepare();
            mediaPlayer.start();

            updateNotification();
            if (stateListener != null) {
                stateListener.onTrackChanged(title, artist, mediaPlayer.getDuration());
                stateListener.onPlaybackStateChanged(true);
            }
        } catch (IOException e) {
            Log.e(TAG, "Error playing audio file: " + e.getMessage());
        }
    }

    public void togglePlayPause() {
        if (mediaPlayer == null) return;
        if (mediaPlayer.isPlaying()) {
            mediaPlayer.pause();
            if (stateListener != null) stateListener.onPlaybackStateChanged(false);
        } else {
            mediaPlayer.start();
            if (stateListener != null) stateListener.onPlaybackStateChanged(true);
        }
        updateNotification();
    }

    public boolean isPlaying() {
        return mediaPlayer != null && mediaPlayer.isPlaying();
    }

    public int getCurrentPosition() {
        return mediaPlayer != null ? mediaPlayer.getCurrentPosition() : 0;
    }

    public int getDuration() {
        return mediaPlayer != null ? mediaPlayer.getDuration() : 0;
    }

    public void seekTo(int positionMs) {
        if (mediaPlayer != null) {
            mediaPlayer.seekTo(positionMs);
        }
    }

    public String getCurrentTitle() { return currentTitle; }
    public String getCurrentArtist() { return currentArtist; }

    public void setPlaybackStateListener(PlaybackStateListener listener) {
        this.stateListener = listener;
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        if (stateListener != null) {
            stateListener.onTrackCompleted();
        }
        updateNotification();
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        Log.e(TAG, "MediaPlayer error: " + what + ", extra: " + extra);
        initMediaPlayer();
        return true;
    }

    private void updateNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification(currentTitle, currentArtist, isPlaying()));
        }
    }

    private Notification buildNotification(String title, String artist, boolean isPlaying) {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingOpenApp = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent toggleIntent = new Intent(this, BackgroundMediaService.class).setAction(ACTION_TOGGLE_PLAY);
        PendingIntent pToggle = PendingIntent.getService(this, 1, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0));

        Intent nextIntent = new Intent(this, BackgroundMediaService.class).setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(this, 2, nextIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0));

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingOpenApp)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_media_previous, "Previous", pToggle)
            .addAction(playPauseIcon, isPlaying ? "Pause" : "Play", pToggle)
            .addAction(android.R.drawable.ic_media_next, "Next", pNext)
            .setOngoing(isPlaying)
            .setSilent(true)
            .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "Media Hub Playback & Web Hub",
                NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.setDescription("Controls for in-app music playback and background local media server");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        if (mediaServer != null) {
            mediaServer.stop();
            isServerRunning = false;
        }
    }
}
