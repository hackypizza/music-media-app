# Personal Media Hub 🎵 📡

A modern Android application and local Wi-Fi media server for Android 13+ (API 33-35).

## Features
- **Modern In-App Music Player**:
  - Full local MediaStore audio playback with artist, title, album art, and duration.
  - Interactive scrubbable Seekbar and standard media controls (Play/Pause, Next, Previous).
  - Instant live search & filtering across your music library.
- **Silent Background Wi-Fi Server**:
  - `BackgroundMediaService` runs as an Android `ForegroundService` with notification playback controls.
  - NanoHTTPD web server runs silently on port `8080`.
  - Family members or other devices on your local Wi-Fi can open `http://<device-ip>:8080` in any browser to stream audio, browse photos, and watch videos.
- **Android 13+ Granular Permissions**:
  - `READ_MEDIA_AUDIO`
  - `READ_MEDIA_IMAGES`
  - `READ_MEDIA_VIDEO`
  - `POST_NOTIFICATIONS`
  - `FOREGROUND_SERVICE` & `FOREGROUND_SERVICE_MEDIA_PLAYBACK`
- **GitHub Actions Automated CI**:
  - Preconfigured `.github/workflows/build-apk.yml` automatically compiles and packages the APK as an artifact on every push.

## Building and Running
1. Clone the repository.
2. Open in Android Studio Hedgehog or newer.
3. Sync Gradle and run on an Android device or emulator with Android 13+.
