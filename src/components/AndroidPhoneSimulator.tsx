import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Search, 
  Radio, 
  Cast, 
  Copy, 
  ExternalLink, 
  Check, 
  Music, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';
import { MediaAudio, MediaImage, MediaVideo, formatDurationMs } from '../data/sampleMedia';

interface AndroidPhoneSimulatorProps {
  isServerRunning: boolean;
  onToggleServer?: () => void;
  activeIp: string;
  onIpChange: (newIp: string) => void;
  port: number;
  audios: MediaAudio[];
  images: MediaImage[];
  videos: MediaVideo[];
  serverLogs: Array<{ id: string; time: string; method: string; path: string; status: number }>;
  onOpenDashboard: () => void;
  onLogRequest?: (method: string, path: string, status: number) => void;
}

export const AndroidPhoneSimulator: React.FC<AndroidPhoneSimulatorProps> = ({
  isServerRunning,
  activeIp,
  onIpChange,
  port,
  audios,
  images,
  videos,
  serverLogs,
  onOpenDashboard,
  onLogRequest
}) => {
  // Search query in music player
  const [searchQuery, setSearchQuery] = useState('');
  
  // In-app music playback state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(24);
  const [duration, setDuration] = useState(194);
  const [showWifiDialog, setShowWifiDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hidden audio element for real in-app sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Permissions state
  const [audioPerm, setAudioPerm] = useState(true);
  const [notifPerm, setNotifPerm] = useState(true);

  const currentTrack = audios[currentTrackIndex] || audios[0];
  const fullUrl = `http://${activeIp}:${port}`;

  const filteredSongs = audios.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSong = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    onLogRequest?.('APP', `MediaPlayer.play("${audios[index]?.title}")`, 200);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      onLogRequest?.('APP', 'MediaPlayer.pause()', 200);
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
      onLogRequest?.('APP', 'MediaPlayer.resume()', 200);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % audios.length;
    handleSelectSong(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentTrackIndex - 1 + audios.length) % audios.length;
    handleSelectSong(prevIndex);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      
      {/* Smartphone Device Frame */}
      <div className="relative mx-auto w-[330px] sm:w-[350px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800">
        
        {/* Notch / Speaker hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 z-30">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-10 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Audio Element for in-app sound */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.sampleUrl}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              setProgress(Math.floor(el.currentTime));
              if (el.duration) setDuration(Math.floor(el.duration));
            }}
            onEnded={handleNext}
          />
        )}

        {/* Screen Container */}
        <div className="relative w-full bg-[#0B111E] rounded-[34px] overflow-hidden flex flex-col min-h-[660px] text-slate-100 shadow-inner">
          
          {/* Android Status Bar */}
          <div className="h-9 px-6 pt-2 flex items-center justify-between text-xs text-slate-400 select-none bg-[#131D31]">
            <span className="font-medium text-slate-200">10:45 AM</span>
            <div className="flex items-center gap-1.5">
              <span title="Silent Wi-Fi Hub Active">
                <Cast className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              </span>
              <Radio className="w-3.5 h-3.5 text-slate-200" />
              <span className="text-[10px] font-mono">92%</span>
            </div>
          </div>

          {/* Music Player Header */}
          <div className="bg-[#131D31] px-4 py-3 border-b border-[#1E2C4A]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-base tracking-tight text-white">
                  My Music
                </h1>
                <div className="text-[11px] text-slate-400">
                  {filteredSongs.length} local tracks
                </div>
              </div>

              {/* Discreet Wi-Fi broadcast icon */}
              <button
                onClick={() => setShowWifiDialog(true)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-blue-400 transition-colors flex items-center gap-1.5"
                title="Wi-Fi Streaming Hub"
              >
                <Cast className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Hub</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs or artists..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0B111E] border border-[#1E2C4A] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Song List (RecyclerView) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 pb-28">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No songs match your search.
              </div>
            ) : (
              filteredSongs.map((song, idx) => {
                const isCurrent = currentTrackIndex === idx;
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-blue-600/15 border border-blue-500/40 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Album Art Placeholder with Equalizer */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'bg-[#18233C] text-blue-400'
                      }`}>
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                            <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.1s] h-4" />
                            <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.2s] h-2" />
                          </div>
                        ) : (
                          <Music className="w-4 h-4" />
                        )}
                      </div>

                      <div className="truncate">
                        <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-blue-400' : 'text-slate-100'}`}>
                          {song.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {song.artist}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                      {formatDurationMs(song.duration)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Persistent Bottom Music Player Bar */}
          {currentTrack && (
            <div className="absolute bottom-9 left-2 right-2 bg-[#131D31]/95 backdrop-blur-md rounded-2xl p-3 border border-[#1E2C4A] shadow-2xl z-20">
              
              {/* Scrubbable Seek Bar */}
              <div className="space-y-1 mb-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProgress(val);
                    if (audioRef.current) audioRef.current.currentTime = val;
                  }}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>{formatDurationMs(progress * 1000)}</span>
                  <span>{formatDurationMs(duration * 1000)}</span>
                </div>
              </div>

              {/* Player Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-white truncate">
                      {currentTrack.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentTrack.artist}
                    </div>
                  </div>
                </div>

                {/* Media Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors"
                    title="Previous"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-md"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-1.5 text-slate-300 hover:text-white transition-colors"
                    title="Next"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Android Navigation Bar */}
          <div className="h-9 bg-[#0B111E] flex items-center justify-around text-slate-500 px-12 z-10">
            <div className="w-3 h-3 border-2 border-slate-500 rounded-sm" />
            <div className="w-3 h-3 border-2 border-slate-500 rounded-full" />
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-500" />
          </div>

          {/* Wi-Fi Hub Dialog Modal */}
          {showWifiDialog && (
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setShowWifiDialog(false)}
            >
              <div 
                className="bg-[#18233C] rounded-2xl p-5 border border-[#1E2C4A] shadow-2xl w-full text-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">
                    Background Server Active
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">
                  Local Wi-Fi Streaming Hub
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  While you listen to music, NanoHTTPD continues streaming your audio, photos, and videos to any device on the network.
                </p>

                <div className="mt-3 p-2.5 bg-[#0A0E1A] rounded-xl border border-[#1E2A44] font-mono text-xs text-blue-400 break-all">
                  {fullUrl}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowWifiDialog(false);
                      onOpenDashboard();
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Web</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowWifiDialog(false)}
                  className="w-full mt-2 py-1.5 text-center text-xs text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Simulator Inspection & Architecture Sidebar */}
      <div className="flex-1 w-full max-w-lg space-y-4">
        
        {/* Background Architecture Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Silent Background Architecture
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              MediaHubService
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ForegroundService (mediaPlayback)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Hosts in-app <code className="text-blue-400">MediaPlayer</code> audio and silently runs <code className="text-blue-400">NanoHTTPD</code> on port 8080. Survives screen-off and app backgrounding.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                <span>System Media Notification</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Now playing: <strong className="text-slate-200">{currentTrack?.title}</strong> with lock screen playback controls.
              </p>
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Android 13+ Permissions</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-300">READ_MEDIA_AUDIO</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Granted</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-300">POST_NOTIFICATIONS</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Granted</span>
            </div>
          </div>
        </div>

        {/* Background HTTP Live Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Silent NanoHTTPD & App Event Stream</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              {serverLogs.length} events
            </span>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 h-40 overflow-y-auto font-mono text-[11px] space-y-1.5 border border-slate-800/80">
            {serverLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-slate-300 border-b border-slate-900/60 pb-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500 text-[10px]">{log.time}</span>
                  <span className="font-semibold text-blue-400">{log.method}</span>
                  <span className="text-slate-200 truncate">{log.path}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  log.status === 200 ? 'text-emerald-400 bg-emerald-950/60' : 'text-cyan-400 bg-cyan-950/60'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Web Client Switcher */}
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-xs text-blue-200">
            <span className="font-semibold block">Browser Streaming Still Active!</span>
            Open the Web Client tab to test remote audio, photo, and video streaming.
          </div>
          <button
            onClick={onOpenDashboard}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Open Web Client
          </button>
        </div>

      </div>

    </div>
  );
};
