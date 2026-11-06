package com.example.personalmediahub;

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
}
