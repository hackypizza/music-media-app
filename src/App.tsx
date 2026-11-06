import React, { useState } from 'react';
import { 
  Smartphone, 
  Globe, 
  FolderGit2, 
  BookOpen, 
  Download, 
  Radio, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AndroidPhoneSimulator } from './components/AndroidPhoneSimulator';
import { WebDashboardPreview } from './components/WebDashboardPreview';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { 
  INITIAL_AUDIOS, 
  INITIAL_IMAGES, 
  INITIAL_VIDEOS, 
  MediaAudio, 
  MediaImage, 
  MediaVideo 
} from './data/sampleMedia';
import { generateAndroidProjectZip, triggerDownload } from './utils/zipExport';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'webclient' | 'code' | 'docs'>('simulator');
  const [isServerRunning, setIsServerRunning] = useState(true);
  const [activeIp, setActiveIp] = useState('192.168.1.108');
  const [port] = useState(8080);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic media collections
  const [audios, setAudios] = useState<MediaAudio[]>(INITIAL_AUDIOS);
  const [images, setImages] = useState<MediaImage[]>(INITIAL_IMAGES);
  const [videos, setVideos] = useState<MediaVideo[]>(INITIAL_VIDEOS);

  // Live HTTP access logs
  const [serverLogs, setServerLogs] = useState<Array<{ id: string; time: string; method: string; path: string; status: number }>>([
    { id: '1', time: '10:41:02', method: 'GET', path: '/', status: 200 },
    { id: '2', time: '10:41:04', method: 'GET', path: '/api/audio', status: 200 },
    { id: '3', time: '10:41:15', method: 'GET', path: '/stream/audio/101', status: 206 },
  ]);

  const logRequest = (method: string, path: string, status: number) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog = {
      id: Math.random().toString(36).substring(7),
      time: timeStr,
      method,
      path,
      status
    };
    setServerLogs(prev => [newLog, ...prev.slice(0, 39)]);
  };

  const handleAddMedia = (type: 'audio' | 'image' | 'video', item: any) => {
    if (type === 'audio') setAudios(prev => [item, ...prev]);
    if (type === 'image') setImages(prev => [item, ...prev]);
    if (type === 'video') setVideos(prev => [item, ...prev]);
    logRequest('POST', `/api/${type === 'image' ? 'images' : type}`, 200);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidProjectZip();
      triggerDownload(blob, 'PersonalMediaHub-AndroidStudio.zip');
    } catch (e) {
      console.error('Error generating project zip:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/40">
            H
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2">
              <span>Personal Media Hub</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                Android 13+
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              NanoHTTPD 8080 · MediaStore Scoped Storage · HTTP 206 Streaming
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('webclient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'webclient'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Client (http://{activeIp}:{port})</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Project Files & Code</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Setup & Architecture</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-900/30 transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isExporting ? 'Packaging...' : 'Download Project (.ZIP)'}
            </span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: DEVICE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Interactive Android Phone Simulator</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test the Start/Stop toggle button, permission prompts, Wi-Fi IP resolver, and inspect incoming NanoHTTPD requests.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isServerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="font-mono text-slate-300">
                    {isServerRunning ? `Listening on port ${port}` : 'Server stopped'}
                  </span>
                </div>
              </div>
            </div>

            <AndroidPhoneSimulator
              isServerRunning={isServerRunning}
              onToggleServer={() => setIsServerRunning(!isServerRunning)}
              activeIp={activeIp}
              onIpChange={setActiveIp}
              port={port}
              audios={audios}
              images={images}
              videos={videos}
              serverLogs={serverLogs}
              onOpenDashboard={() => setActiveTab('webclient')}
              onLogRequest={logRequest}
            />
          </div>
        )}

        {/* TAB 2: WEB CLIENT DASHBOARD PREVIEW */}
        {activeTab === 'webclient' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Live NanoHTTPD Web Dashboard</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  This is the exact HTML/CSS/JS page served by <code className="text-blue-400">MediaServer.java</code> to devices on the local Wi-Fi.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  ← Back to Phone Simulator
                </button>
              </div>
            </div>

            <WebDashboardPreview
              isServerRunning={isServerRunning}
              activeIp={activeIp}
              port={port}
              audios={audios}
              images={images}
              videos={videos}
              onLogRequest={logRequest}
              onAddMedia={handleAddMedia}
            />
          </div>
        )}

        {/* TAB 3: PROJECT CODE STUDIO */}
        {activeTab === 'code' && (
          <CodeExplorer />
        )}

        {/* TAB 4: ARCHITECTURE & SETUP GUIDE */}
        {activeTab === 'docs' && (
          <ArchitectureGuide />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
        Personal Media Hub · Android Studio Project with NanoHTTPD, MediaStore API & GitHub Actions CI
      </footer>

    </div>
  );
}
