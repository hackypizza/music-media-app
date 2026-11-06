package com.example.personalmediahub;

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
}
