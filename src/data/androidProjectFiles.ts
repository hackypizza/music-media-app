/**
 * Complete Android Studio Project Source Files
 * Personal Media Hub - Modern Music Player with Hidden Background NanoHTTPD Server
 */

export interface ProjectFile {
  path: string;
  name: string;
  language: 'xml' | 'java' | 'groovy' | 'yaml' | 'markdown' | 'json';
  description: string;
  category: 'manifest' | 'gradle' | 'java' | 'layout' | 'res' | 'workflow' | 'docs';
  content: string;
}

const ANDROID_MANIFEST_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.personalmediahub">

    <!-- Network permissions for background NanoHTTPD server -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Android 13+ (API level 33+) granular media permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- Android 13+ Notification Permission -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Backward compatibility for Android 12 and below (API <= 32) -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Foreground Service permissions for background playback and streaming -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PersonalMediaHub"
        android:usesCleartextTraffic="true"
        tools:targetApi="34">

        <!-- Main Music Player Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Background Service: Handles MediaPlayer playback & Silent NanoHTTPD Server -->
        <service
            android:name=".BackgroundMediaService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback" />

    </application>

</manifest>`;

const APP_BUILD_GRADLE_CONTENT = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 33

    defaultConfig {
        applicationId "com.example.personalmediahub"
        minSdkVersion 24
        targetSdkVersion 33
        versionCode 2
        versionName "2.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    // NanoHTTPD lightweight embedded HTTP server running in background
    implementation 'org.nanohttpd:nanohttpd:2.3.1'

    // Google Gson for JSON serialization
    implementation 'com.google.code.gson:gson:2.8.9'

    // AndroidX & Material Components compatible with Gradle 6.1.1 and AGP 4.1.3
    implementation 'androidx.appcompat:appcompat:1.4.2'
    implementation 'com.google.android.material:material:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.2.1'
    implementation 'androidx.core:core:1.8.0'
    implementation 'androidx.activity:activity:1.5.1'
    implementation 'androidx.fragment:fragment:1.5.2'
    implementation 'androidx.media:media:1.6.0'

    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
}`;

const ROOT_BUILD_GRADLE_CONTENT = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:4.1.3'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;

const SETTINGS_GRADLE_CONTENT = `rootProject.name = "music-media-app"
include ':app'`;

const MAIN_ACTIVITY_JAVA_CONTENT = `package com.example.personalmediahub;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.example.personalmediahub.databinding.ActivityMainBinding;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Main Activity for Personal Media Hub.
 * Manages runtime permissions, starts BackgroundMediaService silently in the background,
 * and hosts the modern MusicPlayerFragment.
 */
public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;

    // Granular permissions launcher for Android 13+
    private final ActivityResultLauncher<String[]> permissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), this::onPermissionsResult);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Launch the music player UI directly
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, new MusicPlayerFragment())
                    .commit();
        }

        // Check permissions and start background service
        if (hasRequiredPermissions()) {
            startBackgroundMediaService();
        } else {
            requestRequiredPermissions();
        }
    }

    /**
     * Starts BackgroundMediaService which hosts both MediaPlayer audio and silent NanoHTTPD on port 8080.
     */
    public void startBackgroundMediaService() {
        Intent intent = new Intent(this, BackgroundMediaService.class);
        ContextCompat.startForegroundService(this, intent);
    }

    private boolean hasRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean audio = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_AUDIO) == PackageManager.PERMISSION_GRANTED;
            boolean notif = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            return audio && notif;
        } else {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        }
    }

    private void requestRequiredPermissions() {
        List<String> perms = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            perms.add(Manifest.permission.READ_MEDIA_AUDIO);
            perms.add(Manifest.permission.READ_MEDIA_IMAGES);
            perms.add(Manifest.permission.READ_MEDIA_VIDEO);
            perms.add(Manifest.permission.POST_NOTIFICATIONS);
        } else {
            perms.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        }
        permissionLauncher.launch(perms.toArray(new String[0]));
    }

    private void onPermissionsResult(Map<String, Boolean> results) {
        if (hasRequiredPermissions()) {
            startBackgroundMediaService();
            // Notify fragment to load tracks
            MusicPlayerFragment fragment = (MusicPlayerFragment) getSupportFragmentManager().findFragmentById(R.id.fragment_container);
            if (fragment != null) {
                fragment.loadMediaStoreSongs();
            }
        } else {
            showPermissionRationale();
        }
    }

    private void showPermissionRationale() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Media Permissions Required")
                .setMessage("Personal Media Hub needs access to your audio library to play music and stream media over your local Wi-Fi.")
                .setPositiveButton("Settings", (d, w) -> {
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.fromParts("package", getPackageName(), null));
                    startActivity(intent);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}`;

const MUSIC_PLAYER_FRAGMENT_JAVA_CONTENT = `package com.example.personalmediahub;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.SeekBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.personalmediahub.databinding.DialogWifiHubBinding;
import com.example.personalmediahub.databinding.FragmentMusicPlayerBinding;
import com.example.personalmediahub.databinding.ItemSongBinding;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Modern In-App Music Player Fragment.
 * Displays local MediaStore audio tracks in a clean list with instant search,
 * and controls in-app audio playback via BackgroundMediaService.
 */
public class MusicPlayerFragment extends Fragment implements BackgroundMediaService.PlaybackCallback {

    private FragmentMusicPlayerBinding binding;
    private BackgroundMediaService mediaService;
    private boolean isBound = false;

    private final List<MediaServer.AudioItem> allSongs = new ArrayList<>();
    private final List<MediaServer.AudioItem> displayedSongs = new ArrayList<>();
    private SongAdapter songAdapter;

    private final Handler progressHandler = new Handler(Looper.getMainLooper());
    private boolean isUserSeeking = false;

    // Service connection to bound BackgroundMediaService
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            BackgroundMediaService.LocalBinder binder = (BackgroundMediaService.LocalBinder) service;
            mediaService = binder.getService();
            mediaService.registerCallback(MusicPlayerFragment.this);
            isBound = true;

            // Sync currently playing track
            MediaServer.AudioItem current = mediaService.getCurrentTrack();
            if (current != null) {
                updateBottomPlayerUI(current, mediaService.isPlaying());
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            mediaService = null;
            isBound = false;
        }
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMusicPlayerBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupRecyclerView();
        setupPlayerControls();
        setupTopBar();
        bindToBackgroundService();
        loadMediaStoreSongs();
        startProgressUpdater();
    }

    private void setupTopBar() {
        // Discreet Wi-Fi broadcast icon
        binding.btnWifiHub.setOnClickListener(v -> showWifiHubDialog());

        // Instant search filtering
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterSongs(s.toString());
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void setupRecyclerView() {
        songAdapter = new SongAdapter(displayedSongs, (song, position) -> {
            if (mediaService != null) {
                mediaService.playTrack(song, displayedSongs, position);
                updateBottomPlayerUI(song, true);
            }
        });
        binding.rvSongs.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvSongs.setAdapter(songAdapter);
    }

    private void setupPlayerControls() {
        // Play / Pause toggle
        binding.btnPlayPause.setOnClickListener(v -> {
            if (mediaService != null) {
                if (mediaService.isPlaying()) {
                    mediaService.pause();
                    binding.btnPlayPause.setIconResource(R.drawable.ic_play);
                } else {
                    mediaService.resume();
                    binding.btnPlayPause.setIconResource(R.drawable.ic_pause);
                }
            }
        });

        // Next / Previous buttons
        binding.btnNext.setOnClickListener(v -> {
            if (mediaService != null) mediaService.playNext();
        });

        binding.btnPrev.setOnClickListener(v -> {
            if (mediaService != null) mediaService.playPrevious();
        });

        // Scrubbable SeekBar
        binding.seekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser) {
                    binding.tvCurrentTime.setText(formatDuration(progress));
                }
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                isUserSeeking = true;
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                isUserSeeking = false;
                if (mediaService != null) {
                    mediaService.seekTo(seekBar.getProgress());
                }
            }
        });
    }

    private void bindToBackgroundService() {
        Context context = requireContext();
        Intent intent = new Intent(context, BackgroundMediaService.class);
        context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    public void loadMediaStoreSongs() {
        new Thread(() -> {
            if (getContext() == null) return;
            MediaServer tempServer = new MediaServer(requireContext().getApplicationContext(), 8080);
            List<MediaServer.AudioItem> songs = tempServer.queryAudioFiles();

            if (getActivity() != null) {
                getActivity().runOnUiThread(() -> {
                    allSongs.clear();
                    allSongs.addAll(songs);
                    displayedSongs.clear();
                    displayedSongs.addAll(songs);
                    if (songAdapter != null) songAdapter.notifyDataSetChanged();

                    if (binding != null) {
                        binding.tvSongCount.setText(String.format(Locale.getDefault(), "%d songs found", allSongs.size()));
                        binding.emptyView.setVisibility(allSongs.isEmpty() ? View.VISIBLE : View.GONE);
                    }
                });
            }
        }).start();
    }

    private void filterSongs(String query) {
        displayedSongs.clear();
        if (query.trim().isEmpty()) {
            displayedSongs.addAll(allSongs);
        } else {
            String lower = query.toLowerCase();
            for (MediaServer.AudioItem song : allSongs) {
                if (song.title.toLowerCase().contains(lower) || song.artist.toLowerCase().contains(lower)) {
                    displayedSongs.add(song);
                }
            }
        }
        if (songAdapter != null) songAdapter.notifyDataSetChanged();
    }

    private void updateBottomPlayerUI(MediaServer.AudioItem song, boolean isPlaying) {
        if (binding == null) return;
        binding.bottomPlayerCard.setVisibility(View.VISIBLE);
        binding.tvPlayerTitle.setText(song.title);
        binding.tvPlayerArtist.setText(song.artist);
        binding.tvTotalTime.setText(formatDuration((int) song.duration));
        binding.seekBar.setMax((int) song.duration);
        binding.btnPlayPause.setIconResource(isPlaying ? R.drawable.ic_pause : R.drawable.ic_play);
    }

    private void startProgressUpdater() {
        progressHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (mediaService != null && mediaService.isPlaying() && !isUserSeeking && binding != null) {
                    int pos = mediaService.getCurrentPosition();
                    binding.seekBar.setProgress(pos);
                    binding.tvCurrentTime.setText(formatDuration(pos));
                }
                progressHandler.postDelayed(this, 500);
            }
        }, 500);
    }

    @Override
    public void onTrackChanged(MediaServer.AudioItem track) {
        if (getActivity() != null) {
            getActivity().runOnUiThread(() -> {
                updateBottomPlayerUI(track, true);
                if (songAdapter != null) songAdapter.notifyDataSetChanged();
            });
        }
    }

    @Override
    public void onPlaybackStateChanged(boolean isPlaying) {
        if (getActivity() != null) {
            getActivity().runOnUiThread(() -> {
                if (binding != null) {
                    binding.btnPlayPause.setIconResource(isPlaying ? R.drawable.ic_pause : R.drawable.ic_play);
                }
            });
        }
    }

    /**
     * Wi-Fi Hub Dialog: Reveals background streaming link when user wishes to stream to other devices.
     */
    private void showWifiHubDialog() {
        DialogWifiHubBinding dialogBinding = DialogWifiHubBinding.inflate(LayoutInflater.from(requireContext()));
        String ip = (mediaService != null) ? mediaService.getDeviceIpAddress() : "127.0.0.1";
        String url = "http://" + ip + ":8080";

        dialogBinding.tvStreamUrl.setText(url);
        dialogBinding.btnCopy.setOnClickListener(v -> {
            android.content.ClipboardManager clipboard =
                    (android.content.ClipboardManager) requireContext().getSystemService(Context.CLIPBOARD_SERVICE);
            android.content.ClipData clip = android.content.ClipData.newPlainText("Streaming URL", url);
            clipboard.setPrimaryClip(clip);
            Toast.makeText(requireContext(), "Link copied to clipboard!", Toast.LENGTH_SHORT).show();
        });

        dialogBinding.btnOpenBrowser.setOnClickListener(v -> {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(browserIntent);
        });

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Local Wi-Fi Streaming Hub")
                .setView(dialogBinding.getRoot())
                .setPositiveButton("Done", null)
                .show();
    }

    private String formatDuration(int ms) {
        int seconds = (ms / 1000) % 60;
        int minutes = (ms / (1000 * 60));
        return String.format(Locale.getDefault(), "%d:%02d", minutes, seconds);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        progressHandler.removeCallbacksAndMessages(null);
        if (isBound) {
            if (mediaService != null) mediaService.unregisterCallback();
            requireContext().unbindService(serviceConnection);
            isBound = false;
        }
        binding = null;
    }

    private class SongAdapter extends RecyclerView.Adapter<SongAdapter.SongViewHolder> {
        private final List<MediaServer.AudioItem> list;
        private final OnSongClickListener listener;

        SongAdapter(List<MediaServer.AudioItem> list, OnSongClickListener listener) {
            this.list = list;
            this.listener = listener;
        }

        @NonNull
        @Override
        public SongViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemSongBinding b = ItemSongBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new SongViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull SongViewHolder holder, int position) {
            MediaServer.AudioItem song = list.get(position);
            holder.binding.tvTitle.setText(song.title);
            holder.binding.tvArtist.setText(song.artist);
            holder.binding.tvDuration.setText(formatDuration((int) song.duration));

            boolean isCurrent = mediaService != null &&
                    mediaService.getCurrentTrack() != null &&
                    mediaService.getCurrentTrack().id == song.id;

            holder.binding.playingIndicator.setVisibility(isCurrent && mediaService.isPlaying() ? View.VISIBLE : View.GONE);
            holder.binding.tvTitle.setTextColor(ContextCompat.getColor(requireContext(), isCurrent ? R.color.primary_blue : R.color.text_primary));

            holder.itemView.setOnClickListener(v -> listener.onClick(song, position));
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        class SongViewHolder extends RecyclerView.ViewHolder {
            ItemSongBinding binding;
            SongViewHolder(ItemSongBinding b) {
                super(b.getRoot());
                this.binding = b;
            }
        }
    }

    interface OnSongClickListener {
        void onClick(MediaServer.AudioItem song, int position);
    }
}`;

const BACKGROUND_MEDIA_SERVICE_JAVA_CONTENT = `package com.example.personalmediahub;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.provider.MediaStore;
import android.text.format.Formatter;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * BackgroundMediaService (ForegroundService mediaPlayback):
 * 1. Hosts the in-app MediaPlayer audio playback engine.
 * 2. Runs the silent NanoHTTPD HTTP streaming server on port 8080.
 * 3. Shows persistent media playback notification with controls.
 */
public class BackgroundMediaService extends Service implements MediaPlayer.OnCompletionListener, MediaPlayer.OnErrorListener {

    private static final String TAG = "BackgroundMediaService";
    private static final String CHANNEL_ID = "background_media_hub_channel";
    private static final int NOTIFICATION_ID = 1001;
    public static final int SERVER_PORT = 8080;

    public static final String ACTION_PLAY = "com.example.personalmediahub.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.example.personalmediahub.ACTION_PAUSE";
    public static final String ACTION_NEXT = "com.example.personalmediahub.ACTION_NEXT";
    public static final String ACTION_PREV = "com.example.personalmediahub.ACTION_PREV";
    public static final String ACTION_STOP = "com.example.personalmediahub.ACTION_STOP";

    private final IBinder binder = new LocalBinder();
    private MediaPlayer mediaPlayer;
    private MediaServer nanoServer;

    private final List<MediaServer.AudioItem> playlist = new ArrayList<>();
    private int currentIndex = -1;
    private MediaServer.AudioItem currentTrack;
    private PlaybackCallback callback;

    public interface PlaybackCallback {
        void onTrackChanged(MediaServer.AudioItem track);
        void onPlaybackStateChanged(boolean isPlaying);
    }

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
        startSilentNanoServer();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            switch (intent.getAction()) {
                case ACTION_PLAY:
                    resume();
                    break;
                case ACTION_PAUSE:
                    pause();
                    break;
                case ACTION_NEXT:
                    playNext();
                    break;
                case ACTION_PREV:
                    playPrevious();
                    break;
                case ACTION_STOP:
                    stopSelf();
                    break;
            }
        }

        startForeground(NOTIFICATION_ID, buildNotification());
        return START_STICKY;
    }

    private void initMediaPlayer() {
        if (mediaPlayer == null) {
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .build());
            mediaPlayer.setOnCompletionListener(this);
            mediaPlayer.setOnErrorListener(this);
        }
    }

    /**
     * Starts the NanoHTTPD local server silently on port 8080.
     */
    private void startSilentNanoServer() {
        try {
            if (nanoServer == null) {
                nanoServer = new MediaServer(getApplicationContext(), SERVER_PORT);
                nanoServer.start();
                Log.d(TAG, "Silent NanoHTTPD server active on port " + SERVER_PORT);
            }
        } catch (IOException e) {
            Log.e(TAG, "Failed to start silent NanoHTTPD server", e);
        }
    }

    public void playTrack(MediaServer.AudioItem track, List<MediaServer.AudioItem> newPlaylist, int index) {
        this.playlist.clear();
        this.playlist.addAll(newPlaylist);
        this.currentIndex = index;
        this.currentTrack = track;

        Uri contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, track.id);
        try {
            mediaPlayer.reset();
            mediaPlayer.setDataSource(getApplicationContext(), contentUri);
            mediaPlayer.prepare();
            mediaPlayer.start();

            updateNotification();
            if (callback != null) {
                callback.onTrackChanged(currentTrack);
                callback.onPlaybackStateChanged(true);
            }
        } catch (IOException e) {
            Log.e(TAG, "Error playing audio " + contentUri, e);
        }
    }

    public void pause() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            mediaPlayer.pause();
            updateNotification();
            if (callback != null) callback.onPlaybackStateChanged(false);
        }
    }

    public void resume() {
        if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
            mediaPlayer.start();
            updateNotification();
            if (callback != null) callback.onPlaybackStateChanged(true);
        }
    }

    public void playNext() {
        if (!playlist.isEmpty()) {
            currentIndex = (currentIndex + 1) % playlist.size();
            playTrack(playlist.get(currentIndex), playlist, currentIndex);
        }
    }

    public void playPrevious() {
        if (!playlist.isEmpty()) {
            currentIndex = (currentIndex - 1 + playlist.size()) % playlist.size();
            playTrack(playlist.get(currentIndex), playlist, currentIndex);
        }
    }

    public void seekTo(int position) {
        if (mediaPlayer != null) {
            mediaPlayer.seekTo(position);
        }
    }

    public boolean isPlaying() {
        return mediaPlayer != null && mediaPlayer.isPlaying();
    }

    public int getCurrentPosition() {
        return (mediaPlayer != null) ? mediaPlayer.getCurrentPosition() : 0;
    }

    public MediaServer.AudioItem getCurrentTrack() {
        return currentTrack;
    }

    public void registerCallback(PlaybackCallback cb) {
        this.callback = cb;
    }

    public void unregisterCallback() {
        this.callback = null;
    }

    @Override
    public void onCompletion(MediaPlayer mp) {
        playNext();
    }

    @Override
    public boolean onError(MediaPlayer mp, int what, int extra) {
        Log.e(TAG, "MediaPlayer error: " + what + ", " + extra);
        return false;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Background Media Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active playback controls and Wi-Fi streaming status");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                this, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        PendingIntent pPrev = PendingIntent.getService(this, 1, new Intent(this, BackgroundMediaService.class).setAction(ACTION_PREV), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pToggle = PendingIntent.getService(this, 2, new Intent(this, BackgroundMediaService.class).setAction(isPlaying() ? ACTION_PAUSE : ACTION_PLAY), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pNext = PendingIntent.getService(this, 3, new Intent(this, BackgroundMediaService.class).setAction(ACTION_NEXT), PendingIntent.FLAG_IMMUTABLE);

        String title = (currentTrack != null) ? currentTrack.title : "Personal Media Hub";
        String artist = (currentTrack != null) ? currentTrack.artist : "Streaming server active on port " + SERVER_PORT;

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(artist)
                .setSmallIcon(R.drawable.ic_audio)
                .setContentIntent(pendingOpen)
                .addAction(R.drawable.ic_prev, "Previous", pPrev)
                .addAction(isPlaying() ? R.drawable.ic_pause : R.drawable.ic_play, isPlaying() ? "Pause" : "Play", pToggle)
                .addAction(R.drawable.ic_next, "Next", pNext)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle().setShowActionsInCompactView(0, 1, 2))
                .setOngoing(isPlaying())
                .setSilent(true)
                .build();
    }

    private void updateNotification() {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    public String getDeviceIpAddress() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface intf : interfaces) {
                if (intf.isLoopback() || !intf.isUp()) continue;
                List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (ip != null && !ip.startsWith("127.")) return ip;
                    }
                }
            }
            WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                WifiInfo info = wifiManager.getConnectionInfo();
                int ip = info.getIpAddress();
                if (ip != 0) return Formatter.formatIpAddress(ip);
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
        if (nanoServer != null) {
            nanoServer.stop();
            nanoServer = null;
        }
    }
}`;

const MEDIA_SERVER_JAVA_CONTENT = `package com.example.personalmediahub;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.google.gson.Gson;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import fi.iki.elonen.NanoHTTPD;

/**
 * NanoHTTPD Media Streaming Server running silently in BackgroundMediaService.
 * Serves the responsive HTML/JS Web Dashboard and provides binary streaming
 * endpoints with HTTP 206 Range headers for video/audio seeking across local devices.
 */
public class MediaServer extends NanoHTTPD {

    private static final String TAG = "MediaServer";
    private final Context context;
    private final Gson gson = new Gson();

    public static class AudioItem {
        public long id;
        public String title;
        public String artist;
        public long duration;
        public long size;
        public String mimeType;
        public String streamUrl;

        public AudioItem(long id, String title, String artist, long duration, long size, String mimeType) {
            this.id = id;
            this.title = title != null ? title : "Unknown Title";
            this.artist = artist != null ? artist : "Unknown Artist";
            this.duration = duration;
            this.size = size;
            this.mimeType = mimeType != null ? mimeType : "audio/mpeg";
            this.streamUrl = "/stream/audio/" + id;
        }
    }

    public static class ImageItem {
        public long id;
        public String displayName;
        public long size;
        public String mimeType;
        public String streamUrl;

        public ImageItem(long id, String displayName, long size, String mimeType) {
            this.id = id;
            this.displayName = displayName != null ? displayName : "IMG_" + id;
            this.size = size;
            this.mimeType = mimeType != null ? mimeType : "image/jpeg";
            this.streamUrl = "/stream/image/" + id;
        }
    }

    public static class VideoItem {
        public long id;
        public String displayName;
        public long duration;
        public long size;
        public String mimeType;
        public String streamUrl;

        public VideoItem(long id, String displayName, long duration, long size, String mimeType) {
            this.id = id;
            this.displayName = displayName != null ? displayName : "VID_" + id;
            this.duration = duration;
            this.size = size;
            this.mimeType = mimeType != null ? mimeType : "video/mp4";
            this.streamUrl = "/stream/video/" + id;
        }
    }

    public MediaServer(Context context, int port) {
        super(port);
        this.context = context;
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Method method = session.getMethod();
        Map<String, String> headers = session.getHeaders();

        Log.d(TAG, "Background Server Request: " + method + " " + uri);

        try {
            // 1. Root: Serve Single-Page Web Dashboard
            if ("/".equals(uri) || "/index.html".equals(uri)) {
                return newFixedLengthResponse(Response.Status.OK, "text/html; charset=UTF-8", getWebDashboardHtml());
            }

            // 2. JSON API: Audio List
            if ("/api/audio".equals(uri)) {
                List<AudioItem> audios = queryAudioFiles();
                return createJsonResponse(audios);
            }

            // 3. JSON API: Images List
            if ("/api/images".equals(uri)) {
                List<ImageItem> images = queryImageFiles();
                return createJsonResponse(images);
            }

            // 4. JSON API: Videos List
            if ("/api/videos".equals(uri)) {
                List<VideoItem> videos = queryVideoFiles();
                return createJsonResponse(videos);
            }

            // 5. JSON API: Summary Statistics
            if ("/api/stats".equals(uri)) {
                Map<String, Object> stats = new HashMap<>();
                stats.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
                stats.put("androidVersion", Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");
                stats.put("audioCount", queryAudioFiles().size());
                stats.put("imageCount", queryImageFiles().size());
                stats.put("videoCount", queryVideoFiles().size());
                return createJsonResponse(stats);
            }

            // 6. Binary Streaming: Audio
            if (uri.startsWith("/stream/audio/")) {
                long id = Long.parseLong(uri.substring("/stream/audio/".length()));
                Uri contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id);
                return streamMediaContent(contentUri, headers, "audio/mpeg");
            }

            // 7. Binary Streaming: Image
            if (uri.startsWith("/stream/image/")) {
                long id = Long.parseLong(uri.substring("/stream/image/".length()));
                Uri contentUri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id);
                return streamMediaContent(contentUri, headers, "image/jpeg");
            }

            // 8. Binary Streaming: Video (with HTTP 206 Partial Content support)
            if (uri.startsWith("/stream/video/")) {
                long id = Long.parseLong(uri.substring("/stream/video/".length()));
                Uri contentUri = ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id);
                return streamMediaContent(contentUri, headers, "video/mp4");
            }

            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404 Not Found");
        } catch (Exception e) {
            Log.e(TAG, "Error handling request for " + uri, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Server Error: " + e.getMessage());
        }
    }

    private Response streamMediaContent(Uri contentUri, Map<String, String> headers, String fallbackMime) {
        ContentResolver resolver = context.getContentResolver();
        try {
            String mimeType = resolver.getType(contentUri);
            if (mimeType == null) mimeType = fallbackMime;

            long fileLength = 0;
            try (Cursor cursor = resolver.query(contentUri, new String[]{MediaStore.MediaColumns.SIZE}, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    fileLength = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE));
                }
            }

            String range = headers.get("range");
            if (range != null && range.startsWith("bytes=") && fileLength > 0) {
                String[] parts = range.substring(6).split("-");
                long start = Long.parseLong(parts[0]);
                long end = (parts.length > 1 && !parts[1].isEmpty()) ? Long.parseLong(parts[1]) : fileLength - 1;

                if (end >= fileLength) end = fileLength - 1;
                long contentLength = end - start + 1;

                InputStream is = resolver.openInputStream(contentUri);
                if (is != null) {
                    long skipped = is.skip(start);
                    Response res = newFixedLengthResponse(Response.Status.PARTIAL_CONTENT, mimeType, is, contentLength);
                    res.addHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
                    res.addHeader("Accept-Ranges", "bytes");
                    res.addHeader("Content-Length", String.valueOf(contentLength));
                    res.addHeader("Access-Control-Allow-Origin", "*");
                    return res;
                }
            }

            InputStream is = resolver.openInputStream(contentUri);
            if (is == null) {
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Media file not accessible");
            }

            Response res = newFixedLengthResponse(Response.Status.OK, mimeType, is, fileLength);
            res.addHeader("Accept-Ranges", "bytes");
            res.addHeader("Content-Length", String.valueOf(fileLength));
            res.addHeader("Access-Control-Allow-Origin", "*");
            return res;

        } catch (Exception e) {
            Log.e(TAG, "Error streaming media " + contentUri, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Stream error: " + e.getMessage());
        }
    }

    private Response createJsonResponse(Object data) {
        String json = gson.toJson(data);
        Response res = newFixedLengthResponse(Response.Status.OK, "application/json; charset=UTF-8", json);
        res.addHeader("Access-Control-Allow-Origin", "*");
        return res;
    }

    public List<AudioItem> queryAudioFiles() {
        List<AudioItem> list = new ArrayList<>();
        Uri uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        String[] projection = {
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.SIZE,
                MediaStore.Audio.Media.MIME_TYPE
        };

        try (Cursor cursor = context.getContentResolver().query(
                uri, projection, MediaStore.Audio.Media.IS_MUSIC + "!=0", null,
                MediaStore.Audio.Media.TITLE + " ASC")) {

            if (cursor != null) {
                int idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE);
                int artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST);
                int durCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION);
                int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE);
                int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE);

                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idCol);
                    String title = cursor.getString(titleCol);
                    String artist = cursor.getString(artistCol);
                    long duration = cursor.getLong(durCol);
                    long size = cursor.getLong(sizeCol);
                    String mime = cursor.getString(mimeCol);
                    list.add(new AudioItem(id, title, artist, duration, size, mime));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to query audio MediaStore", e);
        }
        return list;
    }

    public List<ImageItem> queryImageFiles() {
        List<ImageItem> list = new ArrayList<>();
        Uri uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        String[] projection = {
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
                MediaStore.Images.Media.SIZE,
                MediaStore.Images.Media.MIME_TYPE
        };

        try (Cursor cursor = context.getContentResolver().query(
                uri, projection, null, null,
                MediaStore.Images.Media.DATE_ADDED + " DESC")) {

            if (cursor != null) {
                int idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
                int nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
                int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE);
                int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE);

                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idCol);
                    String name = cursor.getString(nameCol);
                    long size = cursor.getLong(sizeCol);
                    String mime = cursor.getString(mimeCol);
                    list.add(new ImageItem(id, name, size, mime));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to query images MediaStore", e);
        }
        return list;
    }

    public List<VideoItem> queryVideoFiles() {
        List<VideoItem> list = new ArrayList<>();
        Uri uri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
        String[] projection = {
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.DISPLAY_NAME,
                MediaStore.Video.Media.DURATION,
                MediaStore.Video.Media.SIZE,
                MediaStore.Video.Media.MIME_TYPE
        };

        try (Cursor cursor = context.getContentResolver().query(
                uri, projection, null, null,
                MediaStore.Video.Media.DATE_ADDED + " DESC")) {

            if (cursor != null) {
                int idCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID);
                int nameCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME);
                int durCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION);
                int sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE);
                int mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.MIME_TYPE);

                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idCol);
                    String name = cursor.getString(nameCol);
                    long duration = cursor.getLong(durCol);
                    long size = cursor.getLong(sizeCol);
                    String mime = cursor.getString(mimeCol);
                    list.add(new VideoItem(id, name, duration, size, mime));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to query videos MediaStore", e);
        }
        return list;
    }

    public static String getWebDashboardHtml() {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\\n");
        sb.append("<html lang='en'>\\n");
        sb.append("<head>\\n");
        sb.append("  <meta charset='UTF-8'>\\n");
        sb.append("  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\\n");
        sb.append("  <title>Personal Media Hub</title>\\n");
        sb.append("  <style>\\n");
        sb.append("    :root { --bg: #0b111e; --surface: #131d31; --surface-hover: #1c2a44; --border: #1e2c4a; --primary: #3b82f6; --text: #f8fafc; --text-muted: #94a3b8; }\\n");
        sb.append("    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }\\n");
        sb.append("    body { background: var(--bg); color: var(--text); padding-bottom: 90px; }\\n");
        sb.append("    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }\\n");
        sb.append("    .brand { font-weight: 700; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem; }\\n");
        sb.append("    .tabs { display: flex; gap: 0.25rem; background: var(--bg); padding: 0.25rem; border-radius: 8px; border: 1px solid var(--border); }\\n");
        sb.append("    .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; }\\n");
        sb.append("    .tab-btn.active { background: var(--primary); color: #fff; }\\n");
        sb.append("    main { max-width: 1200px; margin: 1.5rem auto; padding: 0 1rem; }\\n");
        sb.append("    .audio-list { display: flex; flex-direction: column; gap: 0.5rem; }\\n");
        sb.append("    .audio-row { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }\\n");
        sb.append("    .play-btn { background: var(--primary); color: #fff; border: none; padding: 0.4rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }\\n");
        sb.append("    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }\\n");
        sb.append("    .photo-card { aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); background: var(--surface); cursor: pointer; position: relative; }\\n");
        sb.append("    .photo-card img { width: 100%; height: 100%; object-fit: cover; }\\n");
        sb.append("    .photo-name { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.75); padding: 0.4rem; font-size: 0.75rem; }\\n");
        sb.append("    .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }\\n");
        sb.append("    .video-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }\\n");
        sb.append("    .video-card video { width: 100%; aspect-ratio: 16/9; background: #000; }\\n");
        sb.append("    .video-details { padding: 0.75rem; }\\n");
        sb.append("    .player-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #0a0e1a; border-top: 1px solid var(--border); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; z-index: 100; }\\n");
        sb.append("  </style>\\n");
        sb.append("</head>\\n");
        sb.append("<body>\\n");
        sb.append("  <header>\\n");
        sb.append("    <div class='brand'>Personal Media Hub</div>\\n");
        sb.append("    <nav class='tabs'>\\n");
        sb.append("      <button class='tab-btn active' onclick='switchTab(\"audio\", event)'>Music</button>\\n");
        sb.append("      <button class='tab-btn' onclick='switchTab(\"photos\", event)'>Photos</button>\\n");
        sb.append("      <button class='tab-btn' onclick='switchTab(\"videos\", event)'>Videos</button>\\n");
        sb.append("    </nav>\\n");
        sb.append("  </header>\\n");
        sb.append("  <main>\\n");
        sb.append("    <div id='audioSection' class='audio-list'></div>\\n");
        sb.append("    <div id='photosSection' class='photo-grid' style='display:none;'></div>\\n");
        sb.append("    <div id='videosSection' class='video-grid' style='display:none;'></div>\\n");
        sb.append("  </main>\\n");
        sb.append("  <div class='player-bar' id='playerBar' style='display:none;'>\\n");
        sb.append("    <div id='currentTrack' style='font-size:0.875rem;'>Not playing</div>\\n");
        sb.append("    <audio id='audioElement' controls autoplay></audio>\\n");
        sb.append("  </div>\\n");
        sb.append("  <script>\\n");
        sb.append("    function switchTab(tab, e) {\n");
        sb.append("      document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });\n");
        sb.append("      if (e && e.target) e.target.classList.add('active');\n");
        sb.append("      document.getElementById('audioSection').style.display = tab === 'audio' ? 'flex' : 'none';\n");
        sb.append("      document.getElementById('photosSection').style.display = tab === 'photos' ? 'grid' : 'none';\n");
        sb.append("      document.getElementById('videosSection').style.display = tab === 'videos' ? 'grid' : 'none';\n");
        sb.append("      loadMedia(tab);\n");
        sb.append("    }\n");
        sb.append("    function loadMedia(tab) {\n");
        sb.append("      if (tab === 'audio') fetch('/api/audio').then(function(r){return r.json();}).then(renderAudio);\n");
        sb.append("      if (tab === 'photos') fetch('/api/images').then(function(r){return r.json();}).then(renderPhotos);\n");
        sb.append("      if (tab === 'videos') fetch('/api/videos').then(function(r){return r.json();}).then(renderVideos);\n");
        sb.append("    }\n");
        sb.append("    function renderAudio(items) {\n");
        sb.append("      var c = document.getElementById('audioSection');\n");
        sb.append("      if (!items || !items.length) { c.innerHTML = '<p style=\"color:var(--text-muted);\">No audio tracks found.</p>'; return; }\n");
        sb.append("      var html = '';\n");
        sb.append("      for (var i = 0; i < items.length; i++) {\n");
        sb.append("        var it = items[i];\n");
        sb.append("        html += '<div class=\"audio-row\"><div><div style=\"font-weight:600;\">' + it.title + '</div><div style=\"color:var(--text-muted);font-size:0.8rem;\">' + it.artist + '</div></div><button class=\"play-btn\" onclick=\"playTrack(\\'' + it.streamUrl + '\\', \\'' + encodeURIComponent(it.title) + '\\')\">Play</button></div>';\n");
        sb.append("      }\n");
        sb.append("      c.innerHTML = html;\n");
        sb.append("    }\n");
        sb.append("    function renderPhotos(items) {\n");
        sb.append("      var c = document.getElementById('photosSection');\n");
        sb.append("      if (!items || !items.length) { c.innerHTML = '<p style=\"color:var(--text-muted);\">No photos found.</p>'; return; }\n");
        sb.append("      var html = '';\n");
        sb.append("      for (var i = 0; i < items.length; i++) {\n");
        sb.append("        var it = items[i];\n");
        sb.append("        html += '<div class=\"photo-card\"><img src=\"' + it.streamUrl + '\" loading=\"lazy\" alt=\"\" /><div class=\"photo-name\">' + it.displayName + '</div></div>';\n");
        sb.append("      }\n");
        sb.append("      c.innerHTML = html;\n");
        sb.append("    }\n");
        sb.append("    function renderVideos(items) {\n");
        sb.append("      var c = document.getElementById('videosSection');\n");
        sb.append("      if (!items || !items.length) { c.innerHTML = '<p style=\"color:var(--text-muted);\">No videos found.</p>'; return; }\n");
        sb.append("      var html = '';\n");
        sb.append("      for (var i = 0; i < items.length; i++) {\n");
        sb.append("        var it = items[i];\n");
        sb.append("        html += '<div class=\"video-card\"><video src=\"' + it.streamUrl + '\" controls preload=\"metadata\"></video><div class=\"video-details\">' + it.displayName + '</div></div>';\n");
        sb.append("      }\n");
        sb.append("      c.innerHTML = html;\n");
        sb.append("    }\n");
        sb.append("    function playTrack(url, title) {\n");
        sb.append("      document.getElementById('currentTrack').textContent = decodeURIComponent(title);\n");
        sb.append("      var audio = document.getElementById('audioElement');\n");
        sb.append("      audio.src = url;\n");
        sb.append("      document.getElementById('playerBar').style.display = 'flex';\n");
        sb.append("      audio.play();\n");
        sb.append("    }\n");
        sb.append("    loadMedia('audio');\n");
        sb.append("  </script>\n");
        sb.append("</body>\n");
        sb.append("</html>\n");
        return sb.toString();
    }
}`;

const ACTIVITY_MAIN_XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragment_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_screen" />`;

const FRAGMENT_MUSIC_PLAYER_XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_screen">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/surface_card"
        app:elevation="0dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:paddingStart="16dp"
            android:paddingEnd="16dp"
            android:paddingTop="12dp"
            android:paddingBottom="12dp">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:gravity="center_vertical"
                android:orientation="horizontal">

                <TextView
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:text="My Music"
                    android:textColor="@color/text_primary"
                    android:textSize="22sp"
                    android:textStyle="bold" />

                <!-- Discreet button to inspect background streaming link -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnWifiHub"
                    style="@style/Widget.Material3.Button.IconButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    app:icon="@drawable/ic_cast"
                    app:iconTint="@color/primary_blue" />

            </LinearLayout>

            <com.google.android.material.textfield.TextInputLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                app:boxCornerRadiusBottomEnd="12dp"
                app:boxCornerRadiusBottomStart="12dp"
                app:boxCornerRadiusTopEnd="12dp"
                app:boxCornerRadiusTopStart="12dp"
                app:boxStrokeWidth="0dp"
                app:boxStrokeWidthFocused="1dp"
                app:boxBackgroundColor="@color/bg_screen"
                app:startIconDrawable="@drawable/ic_search"
                app:startIconTint="@color/text_secondary"
                app:hintEnabled="false">

                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etSearch"
                    android:layout_width="match_parent"
                    android:layout_height="44dp"
                    android:paddingTop="0dp"
                    android:paddingBottom="0dp"
                    android:hint="Search tracks or artists..."
                    android:textColor="@color/text_primary"
                    android:textColorHint="@color/text_secondary"
                    android:textSize="13sp" />

            </com.google.android.material.textfield.TextInputLayout>

            <TextView
                android:id="@+id/tvSongCount"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:text="Scanning library..."
                android:textColor="@color/text_secondary"
                android:textSize="12sp" />

        </LinearLayout>

    </com.google.android.material.appbar.AppBarLayout>

    <!-- Song List RecyclerView -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rvSongs"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:clipToPadding="false"
        android:paddingBottom="120dp"
        app:layout_behavior="@string/appbar_scrolling_view_behavior" />

    <!-- Empty State -->
    <LinearLayout
        android:id="@+id/emptyView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:orientation="vertical"
        android:gravity="center"
        android:visibility="gone">

        <ImageView
            android:layout_width="54dp"
            android:layout_height="54dp"
            android:src="@drawable/ic_audio"
            app:tint="@color/text_secondary" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="12dp"
            android:text="No music tracks found"
            android:textColor="@color/text_secondary"
            android:textSize="14sp" />

    </LinearLayout>

    <!-- Persistent Bottom Music Player Bar -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/bottomPlayerCard"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom"
        android:layout_margin="12dp"
        app:cardCornerRadius="18dp"
        app:cardElevation="10dp"
        app:strokeWidth="1dp"
        app:strokeColor="@color/border_subtle"
        app:cardBackgroundColor="@color/surface_card"
        android:visibility="gone">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:paddingTop="10dp"
            android:paddingBottom="12dp"
            android:paddingStart="14dp"
            android:paddingEnd="14dp">

            <!-- Scrubbable Seek Bar with Timers -->
            <SeekBar
                android:id="@+id/seekBar"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:paddingStart="0dp"
                android:paddingEnd="0dp"
                android:thumbTint="@color/primary_blue"
                android:progressTint="@color/primary_blue" />

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal">

                <TextView
                    android:id="@+id/tvCurrentTime"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:fontFamily="monospace"
                    android:text="0:00"
                    android:textColor="@color/text_secondary"
                    android:textSize="10sp" />

                <View
                    android:layout_width="0dp"
                    android:layout_height="1dp"
                    android:layout_weight="1" />

                <TextView
                    android:id="@+id/tvTotalTime"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:fontFamily="monospace"
                    android:text="0:00"
                    android:textColor="@color/text_secondary"
                    android:textSize="10sp" />

            </LinearLayout>

            <!-- Track Info & Controls Row -->
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="6dp"
                android:gravity="center_vertical"
                android:orientation="horizontal">

                <ImageView
                    android:layout_width="40dp"
                    android:layout_height="40dp"
                    android:background="@drawable/bg_album_art"
                    android:padding="8dp"
                    android:src="@drawable/ic_audio"
                    app:tint="@color/primary_blue" />

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="12dp"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:id="@+id/tvPlayerTitle"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:ellipsize="end"
                        android:maxLines="1"
                        android:text="Select a track"
                        android:textColor="@color/text_primary"
                        android:textSize="14sp"
                        android:textStyle="bold" />

                    <TextView
                        android:id="@+id/tvPlayerArtist"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:ellipsize="end"
                        android:maxLines="1"
                        android:text="Ready to play"
                        android:textColor="@color/text_secondary"
                        android:textSize="12sp" />

                </LinearLayout>

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnPrev"
                    style="@style/Widget.Material3.Button.IconButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    app:icon="@drawable/ic_prev"
                    app:iconTint="@color/text_primary" />

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnPlayPause"
                    style="@style/Widget.Material3.Button.IconButton.Filled"
                    android:layout_width="48dp"
                    android:layout_height="48dp"
                    app:icon="@drawable/ic_play"
                    app:iconTint="@color/text_primary"
                    app:backgroundTint="@color/primary_blue" />

                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnNext"
                    style="@style/Widget.Material3.Button.IconButton"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    app:icon="@drawable/ic_next"
                    app:iconTint="@color/text_primary" />

            </LinearLayout>

        </LinearLayout>

    </com.google.android.material.card.MaterialCardView>

</androidx.coordinatorlayout.widget.CoordinatorLayout>`;

const ITEM_SONG_XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="?attr/selectableItemBackground"
    android:gravity="center_vertical"
    android:orientation="horizontal"
    android:paddingStart="16dp"
    android:paddingEnd="16dp"
    android:paddingTop="10dp"
    android:paddingBottom="10dp">

    <!-- Album Art Thumbnail -->
    <FrameLayout
        android:layout_width="44dp"
        android:layout_height="44dp"
        android:background="@drawable/bg_album_art">

        <ImageView
            android:layout_width="22dp"
            android:layout_height="22dp"
            android:layout_gravity="center"
            android:src="@drawable/ic_audio"
            app:tint="@color/primary_blue" />

        <View
            android:id="@+id/playingIndicator"
            android:layout_width="10dp"
            android:layout_height="10dp"
            android:layout_gravity="top|end"
            android:layout_margin="4dp"
            android:background="@drawable/circle_green"
            android:visibility="gone" />

    </FrameLayout>

    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="14dp"
        android:layout_weight="1"
        android:orientation="vertical">

        <TextView
            android:id="@+id/tvTitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:ellipsize="end"
            android:maxLines="1"
            android:text="Song Title"
            android:textColor="@color/text_primary"
            android:textSize="14sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/tvArtist"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:ellipsize="end"
            android:maxLines="1"
            android:text="Artist Name"
            android:textColor="@color/text_secondary"
            android:textSize="12sp" />

    </LinearLayout>

    <TextView
        android:id="@+id/tvDuration"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="monospace"
        android:text="3:45"
        android:textColor="@color/text_secondary"
        android:textSize="12sp" />

</LinearLayout>`;

const DIALOG_WIFI_HUB_XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="20dp"
    android:background="@color/surface_card">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Background Streaming Active"
        android:textColor="@color/status_online"
        android:textSize="13sp"
        android:textStyle="bold" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Any device on your Wi-Fi can open this link to stream your music, photos, and videos:"
        android:textColor="@color/text_secondary"
        android:textSize="12sp" />

    <TextView
        android:id="@+id/tvStreamUrl"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:background="@drawable/bg_code_box"
        android:fontFamily="monospace"
        android:padding="12dp"
        android:text="http://192.168.1.108:8080"
        android:textColor="@color/primary_blue"
        android:textSize="14sp"
        android:textStyle="bold" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="14dp"
        android:orientation="horizontal">

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnCopy"
            style="@style/Widget.Material3.Button.OutlinedButton"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Copy Link"
            app:icon="@drawable/ic_copy" />

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnOpenBrowser"
            style="@style/Widget.Material3.Button.TonalButton"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="8dp"
            android:layout_weight="1"
            android:text="Open Local"
            app:icon="@drawable/ic_open_in_browser" />

    </LinearLayout>

</LinearLayout>`;

const GITHUB_WORKFLOW_YML_CONTENT = `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Assemble Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 11 (compatible with Gradle 6.1.1 & AGP 4.1.3)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3
        with:
          cache-read-only: false

      - name: Grant Execute Permission to gradlew
        run: chmod +x gradlew

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: personal-media-hub-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`;

const STRINGS_XML_CONTENT = `<resources>
    <string name="app_name">Personal Media Hub</string>
    <string name="my_music">My Music</string>
    <string name="search_hint">Search tracks or artists...</string>
    <string name="ready_to_play">Ready to play</string>
</resources>`;

const COLORS_XML_CONTENT = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="bg_screen">#0B111E</color>
    <color name="surface_card">#131D31</color>
    <color name="border_subtle">#1E2C4A</color>
    <color name="primary_blue">#3B82F6</color>
    <color name="primary_blue_dark">#1D4ED8</color>
    <color name="text_primary">#F8FAFC</color>
    <color name="text_secondary">#94A3B8</color>
    <color name="status_online">#10B981</color>
    <color name="status_offline">#EF4444</color>
</resources>`;

const THEMES_XML_CONTENT = `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.PersonalMediaHub" parent="Theme.Material3.Dark.NoActionBar">
        <item name="colorPrimary">@color/primary_blue</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="android:windowBackground">@color/bg_screen</item>
        <item name="android:statusBarColor">@color/surface_card</item>
        <item name="android:navigationBarColor">@color/bg_screen</item>
    </style>
</resources>`;

const README_CONTENT = `# Personal Media Hub (Modern Music Player + Silent Wi-Fi Server)

A modern Android Music Player with an invisible, background **NanoHTTPD** media streaming server running on port 8080.

---

## 🌟 Key Architecture
1. **Frontend UI (Music Player)**:
   - Direct launch into a clean, modern Music Player interface.
   - MediaStore song catalog indexing (Title, Artist, Duration).
   - Real-time search filter bar.
   - Persistent bottom player bar with seekable progress slider, Play/Pause, Next/Previous controls.
   - In-app audio playback powered by Android \`MediaPlayer\` inside a bound service.

2. **Background Architecture (Hidden Server)**:
   - \`BackgroundMediaService\` runs as a dedicated Android \`ForegroundService\` with \`mediaPlayback\` type.
   - Houses both the in-app audio playback and the silent NanoHTTPD server on port 8080.
   - Persistent playback notification with lock-screen media controls.
   - The IP address and server dashboards are hidden from the main screen UI, but browser access (Audio, Photos, Videos) continues to stream silently in the background!
   - Discreet "Cast/Hub" toolbar button reveals the Wi-Fi link when needed.

---

## 📦 Project Structure
\`\`\`
PersonalMediaHub/
├── app/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/personalmediahub/
│       │   ├── MainActivity.java
│       │   ├── MusicPlayerFragment.java
│       │   ├── BackgroundMediaService.java
│       │   └── MediaServer.java
│       └── res/
│           ├── layout/
│           │   ├── activity_main.xml
│           │   ├── fragment_music_player.xml
│           │   ├── item_song.xml
│           │   └── dialog_wifi_hub.xml
│           └── values/
│               ├── colors.xml
│               ├── strings.xml
│               └── themes.xml
├── .github/workflows/
│   └── build-apk.yml
├── build.gradle
├── settings.gradle
└── README.md
\`\`\`
`;

export const ANDROID_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest declaring BackgroundMediaService foreground service, POST_NOTIFICATIONS, and Android 13+ granular permissions.',
    category: 'manifest',
    content: ANDROID_MANIFEST_CONTENT
  },
  {
    path: 'app/build.gradle',
    name: 'app/build.gradle',
    language: 'groovy',
    description: 'App-level build script with NanoHTTPD, Gson, Material 3, RecyclerView, and androidx.fragment.',
    category: 'gradle',
    content: APP_BUILD_GRADLE_CONTENT
  },
  {
    path: 'build.gradle',
    name: 'build.gradle (Project)',
    language: 'groovy',
    description: 'Root project build script configuring Android Gradle Plugin repositories.',
    category: 'gradle',
    content: ROOT_BUILD_GRADLE_CONTENT
  },
  {
    path: 'settings.gradle',
    name: 'settings.gradle',
    language: 'groovy',
    description: 'Gradle repository management and module inclusion.',
    category: 'gradle',
    content: SETTINGS_GRADLE_CONTENT
  },
  {
    path: 'app/src/main/java/com/example/personalmediahub/MainActivity.java',
    name: 'MainActivity.java',
    language: 'java',
    description: 'Main launcher Activity: requests Android 13+ permissions, starts BackgroundMediaService, and hosts MusicPlayerFragment.',
    category: 'java',
    content: MAIN_ACTIVITY_JAVA_CONTENT
  },
  {
    path: 'app/src/main/java/com/example/personalmediahub/MusicPlayerFragment.java',
    name: 'MusicPlayerFragment.java',
    language: 'java',
    description: 'Modern Music Player Fragment: local MediaStore song list, search filtering, and persistent bottom player controls.',
    category: 'java',
    content: MUSIC_PLAYER_FRAGMENT_JAVA_CONTENT
  },
  {
    path: 'app/src/main/java/com/example/personalmediahub/BackgroundMediaService.java',
    name: 'BackgroundMediaService.java',
    language: 'java',
    description: 'Foreground Service hosting MediaPlayer audio playback, lock screen notification, and silent NanoHTTPD server.',
    category: 'java',
    content: BACKGROUND_MEDIA_SERVICE_JAVA_CONTENT
  },
  {
    path: 'app/src/main/java/com/example/personalmediahub/MediaServer.java',
    name: 'MediaServer.java',
    language: 'java',
    description: 'Silent NanoHTTPD server: serves Web Dashboard and HTTP 206 Range streaming endpoints in the background.',
    category: 'java',
    content: MEDIA_SERVER_JAVA_CONTENT
  },
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    language: 'xml',
    description: 'Main activity container hosting the modern MusicPlayerFragment.',
    category: 'layout',
    content: ACTIVITY_MAIN_XML_CONTENT
  },
  {
    path: 'app/src/main/res/layout/fragment_music_player.xml',
    name: 'fragment_music_player.xml',
    language: 'xml',
    description: 'Music Player Fragment layout: top app bar, search bar, RecyclerView, and persistent bottom playback bar.',
    category: 'layout',
    content: FRAGMENT_MUSIC_PLAYER_XML_CONTENT
  },
  {
    path: 'app/src/main/res/layout/item_song.xml',
    name: 'item_song.xml',
    language: 'xml',
    description: 'RecyclerView song item layout with album art placeholder, title, artist, and playing equalizer indicator.',
    category: 'layout',
    content: ITEM_SONG_XML_CONTENT
  },
  {
    path: 'app/src/main/res/layout/dialog_wifi_hub.xml',
    name: 'dialog_wifi_hub.xml',
    language: 'xml',
    description: 'Wi-Fi streaming hub dialog displaying background HTTP link and QR copy actions.',
    category: 'layout',
    content: DIALOG_WIFI_HUB_XML_CONTENT
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    language: 'yaml',
    description: 'GitHub Actions automated CI pipeline that builds and publishes the debug APK.',
    category: 'workflow',
    content: GITHUB_WORKFLOW_YML_CONTENT
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    language: 'xml',
    description: 'Application string resources.',
    category: 'res',
    content: STRINGS_XML_CONTENT
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    language: 'xml',
    description: 'Modern Dark Theme color palette definition.',
    category: 'res',
    content: COLORS_XML_CONTENT
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    language: 'xml',
    description: 'Material 3 Dark Theme configuration.',
    category: 'res',
    content: THEMES_XML_CONTENT
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'Complete documentation for setup, permissions, testing, and deployment.',
    category: 'docs',
    content: README_CONTENT
  }
];
