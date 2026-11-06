import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Image as ImageIcon, 
  Video, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  Download, 
  Maximize2, 
  Radio, 
  Wifi, 
  Plus,
  Clock,
  HardDrive
} from 'lucide-react';
import { MediaAudio, MediaImage, MediaVideo, formatDurationMs, formatBytes } from '../data/sampleMedia';

interface WebDashboardPreviewProps {
  isServerRunning: boolean;
  activeIp: string;
  port: number;
  audios: MediaAudio[];
  images: MediaImage[];
  videos: MediaVideo[];
  onLogRequest: (method: string, path: string, status: number) => void;
  onAddMedia: (type: 'audio' | 'image' | 'video', item: any) => void;
}

export const WebDashboardPreview: React.FC<WebDashboardPreviewProps> = ({
  isServerRunning,
  activeIp,
  port,
  audios,
  images,
  videos,
  onLogRequest,
  onAddMedia
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'photos' | 'videos'>('audio');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Player State
  const [currentAudio, setCurrentAudio] = useState<MediaAudio | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lightbox Modal for Photos
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null);

  // Video Player State
  const [activeVideo, setActiveVideo] = useState<MediaVideo | null>(videos[0] || null);

  const serverUrl = `http://${activeIp}:${port}`;

  // Log initial page load
  useEffect(() => {
    if (isServerRunning) {
      onLogRequest('GET', '/', 200);
      onLogRequest('GET', `/api/${activeTab === 'photos' ? 'images' : activeTab}`, 200);
    }
  }, [activeTab, isServerRunning]);

  const handlePlayAudio = (track: MediaAudio) => {
    if (currentAudio?.id === track.id) {
      if (isPlayingAudio) {
        audioRef.current?.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlayingAudio(true);
      }
    } else {
      setCurrentAudio(track);
      setIsPlayingAudio(true);
      onLogRequest('GET', `/stream/audio/${track.id}`, 206);
    }
  };

  const handleOpenPhoto = (photo: MediaImage) => {
    setSelectedImage(photo);
    onLogRequest('GET', `/stream/image/${photo.id}`, 200);
  };

  const handlePlayVideo = (video: MediaVideo) => {
    setActiveVideo(video);
    onLogRequest('GET', `/stream/video/${video.id}`, 206);
  };

  // Filtered Media
  const filteredAudios = audios.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImages = images.filter(img =>
    img.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v =>
    v.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isServerRunning) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto my-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Wifi className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          This site can't be reached
        </h3>
        <p className="text-sm text-slate-400 font-mono mb-4">
          {serverUrl} refused to connect.
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          The NanoHTTPD server on the Android device is currently stopped. Turn on the server in the Android Phone Simulator to view and stream media.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[680px]">
      
      {/* Mock Browser Address Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-2 text-slate-300">
          <span className="text-emerald-400 font-semibold text-[10px] uppercase">HTTP</span>
          <span className="text-slate-200">{serverUrl}</span>
          <span className="text-slate-500">/</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Local Wi-Fi Hub</span>
        </div>
      </div>

      {/* Web Dashboard Header (Served by NanoHTTPD) */}
      <header className="bg-slate-900 px-6 py-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-900/30">
            H
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base tracking-tight">
              Personal Media Hub
            </h1>
            <div className="text-xs text-slate-400">
              Streaming directly from Android device storage
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music ({audios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({images.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({videos.length})</span>
          </button>
        </nav>
      </header>

      {/* Search & Media Toolbar */}
      <div className="px-6 py-3.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Add Media</span>
            <input
              type="file"
              className="hidden"
              accept="audio/*,image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                if (file.type.startsWith('audio/')) {
                  onAddMedia('audio', {
                    id: Date.now(),
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    artist: "Local User Upload",
                    album: "Simulated Storage",
                    duration: 180000,
                    size: file.size,
                    mimeType: file.type,
                    sampleUrl: url
                  });
                } else if (file.type.startsWith('image/')) {
                  onAddMedia('image', {
                    id: Date.now(),
                    displayName: file.name,
                    resolution: "Original",
                    size: file.size,
                    dateAdded: "Just now",
                    mimeType: file.type,
                    url: url
                  });
                } else if (file.type.startsWith('video/')) {
                  onAddMedia('video', {
                    id: Date.now(),
                    displayName: file.name,
                    duration: 25000,
                    resolution: "1080p",
                    size: file.size,
                    mimeType: file.type,
                    videoUrl: url,
                    thumbnailUrl: ""
                  });
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* TAB 1: MUSIC */}
        {activeTab === 'audio' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium pb-2 border-b border-slate-800/80 flex items-center justify-between">
              <span>Title & Artist</span>
              <div className="flex items-center gap-8 mr-6">
                <span>Duration</span>
                <span>Size</span>
                <span>Action</span>
              </div>
            </div>

            {filteredAudios.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No audio tracks match your search.
              </div>
            ) : (
              filteredAudios.map((track) => {
                const isSelected = currentAudio?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-900 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handlePlayAudio(track)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          isSelected && isPlayingAudio
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected && isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="truncate">
                        <div className="font-semibold text-xs text-slate-100 truncate">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {track.artist} · {track.album}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-xs text-slate-400 shrink-0">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDurationMs(track.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        <span>{formatBytes(track.size)}</span>
                      </div>
                      <a
                        href={track.sampleUrl}
                        download={track.title + ".mp3"}
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Download stream"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogRequest('GET', `/stream/audio/${track.id}`, 200);
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PHOTOS */}
        {activeTab === 'photos' && (
          <div>
            {filteredImages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No photos found on device storage.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleOpenPhoto(img)}
                    className="group relative aspect-square bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.displayName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <div className="text-[11px] font-medium text-white truncate">
                        {img.displayName}
                      </div>
                      <div className="text-[10px] text-slate-300">
                        {img.resolution} · {formatBytes(img.size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {activeVideo && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <video
                    key={activeVideo.videoUrl}
                    controls
                    playsInline
                    className="w-full h-full"
                    src={activeVideo.videoUrl}
                    onPlay={() => onLogRequest('GET', `/stream/video/${activeVideo.id}`, 206)}
                    onSeeked={() => onLogRequest('GET', `/stream/video/${activeVideo.id}`, 206)}
                  >
                    Your browser does not support HTML5 video.
                  </video>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100">
                      {activeVideo.displayName}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {activeVideo.resolution} · {formatDurationMs(activeVideo.duration)} · {formatBytes(activeVideo.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-mono">
                      HTTP 206 Range Stream
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Video Playlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handlePlayVideo(video)}
                  className={`flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all ${
                    activeVideo?.id === video.id
                      ? 'bg-slate-900 border-blue-500 shadow-md'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={video.thumbnailUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"}
                      alt={video.displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white">
                      {formatDurationMs(video.duration)}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-xs text-slate-200 truncate">
                      {video.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {video.resolution} · {formatBytes(video.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Audio Player Bar */}
      {currentAudio && (
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between gap-4 sticky bottom-0 z-40">
          <audio
            ref={audioRef}
            src={currentAudio.sampleUrl}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              setAudioProgress(el.currentTime);
              setAudioDuration(el.duration || 0);
            }}
            onEnded={() => setIsPlayingAudio(false)}
            autoPlay
          />

          <div className="flex items-center gap-3 min-w-0 max-w-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-xs text-slate-100 truncate">
                {currentAudio.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentAudio.artist}
              </div>
            </div>
          </div>

          {/* Central Controls */}
          <div className="flex-1 max-w-md flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePlayAudio(currentAudio)}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow"
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
            
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>{formatDurationMs(audioProgress * 1000)}</span>
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                value={audioProgress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (audioRef.current) audioRef.current.currentTime = val;
                  setAudioProgress(val);
                }}
                className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span>{formatDurationMs(audioDuration * 1000)}</span>
            </div>
          </div>

          {/* Volume & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !audioMuted;
                  setAudioMuted(!audioMuted);
                }
              }}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setCurrentAudio(null);
                setIsPlayingAudio(false);
              }}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white flex items-center gap-1 text-xs"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.displayName}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            <div className="mt-3 text-center">
              <div className="font-semibold text-sm text-slate-100">
                {selectedImage.displayName}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {selectedImage.resolution} · {formatBytes(selectedImage.size)} · Added {selectedImage.dateAdded}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
