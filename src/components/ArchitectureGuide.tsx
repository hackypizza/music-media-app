import React from 'react';
import { 
  ShieldAlert, 
  Server, 
  Database, 
  Workflow, 
  Wifi, 
  FileCheck, 
  CheckCircle2, 
  Cpu,
  Layers,
  Music,
  Radio,
  Bell
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              In-App Music Player & Silent Background Service Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Technical blueprint detailing how <code className="text-blue-400">MediaHubService</code> runs in the background as a Media Playback ForegroundService, hosting Android <code className="text-emerald-400">MediaPlayer</code> and a silent <code className="text-purple-400">NanoHTTPD</code> web streaming server simultaneously.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Core Technical Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Concept 1: Modern Music Player UI & Android MediaPlayer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Frontend UI & In-App MediaPlayer
              </h3>
              <div className="text-xs text-slate-400">Clean Spotify-Style Music Experience</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              The main interface is now dedicated 100% to music playback:
            </p>
            <ul className="space-y-1.5 text-slate-300">
              <li>• <strong>No Server Clutter</strong>: IP addresses and server dashboards are removed from the main screen.</li>
              <li>• <strong>MediaStore Library</strong>: Real-time cursor indexing of all audio files with search filtering.</li>
              <li>• <strong>Persistent Bottom Player</strong>: Features song title, artist, live scrubber (<code className="text-blue-400">SeekBar</code>), elapsed/total duration, and Play/Pause/Skip controls.</li>
              <li>• <strong>Bound Service Lifecycle</strong>: <code className="text-slate-200">MainActivity</code> binds to <code className="text-blue-400">MediaHubService</code> to synchronize playback state smoothly.</li>
            </ul>
          </div>
        </div>

        {/* Concept 2: MediaHubService (ForegroundService mediaPlayback) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Silent Background Server & Service
              </h3>
              <div className="text-xs text-slate-400">Android 14+ Compliant ForegroundService</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              All server and playback logic runs inside <code className="text-emerald-400">MediaHubService</code>:
            </p>
            <ul className="space-y-1.5 text-slate-300">
              <li>• <strong>Foreground Service Type</strong>: Declared with <code className="text-emerald-400">android:foregroundServiceType="mediaPlayback"</code> in the manifest.</li>
              <li>• <strong>Silent NanoHTTPD</strong>: Binds to port 8080 automatically when the app starts, without needing a manual start button.</li>
              <li>• <strong>Lock Screen Notification</strong>: Displays current song title, artist, and playback action controls via <code className="text-slate-200">androidx.media.app.NotificationCompat.MediaStyle</code>.</li>
              <li>• <strong>Background Survival</strong>: The HTTP server and audio continue playing even when the user locks their screen or switches apps.</li>
            </ul>
          </div>
        </div>

        {/* Concept 3: Android 13+ Granular Permissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Android 13+ Granular Permissions
              </h3>
              <div className="text-xs text-slate-400">API 33+ (Tiramisu) Scoped Access</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              Instead of blanket storage access, the app requests granular permissions:
            </p>
            <ul className="space-y-1.5 pl-2 font-mono text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>android.permission.READ_MEDIA_AUDIO</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>android.permission.POST_NOTIFICATIONS</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Concept 4: HTTP 206 Streaming Intact */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Browser Streaming Endpoints Preserved
              </h3>
              <div className="text-xs text-slate-400">Silent HTTP 206 Partial Content Streaming</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              Even though the server is hidden from the main screen, browser clients connecting to <code className="text-cyan-400">http://&lt;phone-ip&gt;:8080</code> can still browse and stream:
            </p>
            <ul className="space-y-1 text-slate-300">
              <li>• <code className="text-cyan-300 font-mono text-[11px]">/api/audio</code>, <code className="text-cyan-300 font-mono text-[11px]">/api/images</code>, <code className="text-cyan-300 font-mono text-[11px]">/api/videos</code></li>
              <li>• <code className="text-cyan-300 font-mono text-[11px]">/stream/video/&#123;id&#125;</code> with <code className="text-slate-200">HTTP 206 Partial Content (Range header)</code> seeking.</li>
              <li>• Access the link anytime via the subtle <strong>Hub / Cast</strong> icon on the top right of the Music Player.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Background Lifecycle Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              Dual-Thread Process Execution Lifecycle
            </h3>
            <div className="text-xs text-slate-400">How the Music Player & NanoHTTPD coexist without blocking UI</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="font-semibold text-blue-400 block mb-1">1. MainActivity (UI Thread)</span>
            Displays the Music Player, handles user touches, search queries, and SeekBar scrubbing. Binds to MediaHubService.
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="font-semibold text-emerald-400 block mb-1">2. MediaHubService (Foreground)</span>
            Maintains the audio MediaPlayer state machine, updates the playback notification, and triggers track transitions.
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="font-semibold text-purple-400 block mb-1">3. NanoHTTPD (Worker Pool)</span>
            Spawns background socket threads on port 8080, serving HTML/CSS/JS and streaming binary ContentResolver streams to Wi-Fi browsers.
          </div>
        </div>
      </div>

    </div>
  );
};
