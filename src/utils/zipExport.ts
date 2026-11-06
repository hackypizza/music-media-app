import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder("PersonalMediaHub");
  if (!root) throw new Error("Could not create ZIP root folder");

  // Add all files from ANDROID_PROJECT_FILES
  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Add supplementary standard Android Studio files
  root.file("gradle.properties", `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

  root.file("app/proguard-rules.pro", `# Add project specific ProGuard rules here.
# Keep NanoHTTPD classes
-keep class fi.iki.elonen.** { *; }
-keep interface fi.iki.elonen.** { *; }

# Keep data models serialized with Gson
-keepclassmembers class com.example.personalmediahub.MediaServer$* { *; }
`);

  // Simple gradlew script indicator
  root.file("gradlew", `#!/usr/bin/env sh
# Gradle wrapper execution stub
echo "Starting Gradle daemon for Personal Media Hub..."
exec gradle "$@"
`);

  // Vector drawables for buttons and status
  root.file("app/src/main/res/drawable/circle_green.xml", `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#10B981" />
</shape>`);

  root.file("app/src/main/res/drawable/circle_red.xml", `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#EF4444" />
</shape>`);

  root.file("app/src/main/res/drawable/bg_code_box.xml", `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#0A0E1A" />
    <stroke android:width="1dp" android:color="#1E2A44" />
    <corners android:radius="8dp" />
</shape>`);

  root.file("app/src/main/res/drawable/bg_album_art.xml", `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#18233C" />
    <corners android:radius="10dp" />
</shape>`);

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
