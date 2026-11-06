import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FolderTree, 
  Search, 
  Terminal, 
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, ProjectFile } from '../data/androidProjectFiles';
import { generateAndroidProjectZip, triggerDownload } from '../utils/zipExport';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [filterText, setFilterText] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateAndroidProjectZip();
      triggerDownload(blob, 'PersonalMediaHub-AndroidStudio.zip');
    } catch (e) {
      console.error('Failed to create zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const filteredFiles = ANDROID_PROJECT_FILES.filter(f => 
    f.name.toLowerCase().includes(filterText.toLowerCase()) || 
    f.path.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
      
      {/* Top Bar with Actions */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-400" />
            <span>Android Studio Project Source Code</span>
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Complete, production-ready codebase ready to open in Android Studio
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Packaging Project...' : 'Download Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar: File Tree */}
        <div className="w-full lg:w-72 bg-slate-900/50 border-r border-slate-800/80 p-4 flex flex-col gap-3 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter project files..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="text-[10px] uppercase font-semibold text-slate-400 px-1 pt-1 tracking-wider">
            Project Files ({filteredFiles.length})
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[560px] pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                    file.language === 'java' ? 'text-amber-400' :
                    file.language === 'xml' ? 'text-emerald-400' :
                    file.language === 'groovy' ? 'text-blue-400' :
                    file.language === 'yaml' ? 'text-purple-400' : 'text-slate-400'
                  }`} />
                  <div className="truncate flex-1">
                    <div className="truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Code View */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden min-h-[450px]">
          
          {/* File Header Details */}
          <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax / Code Pre */}
          <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-200 bg-[#0B101D]">
            <pre className="overflow-x-auto whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Senior Developer Rationale Footer */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-100">Senior Android Engineering Rationale:</span>{' '}
              {selectedFile.name === 'AndroidManifest.xml' && (
                <span>
                  Declares Android 13+ granular media permissions alongside the backward-compatible <code>android:maxSdkVersion="32"</code> flag for <code>READ_EXTERNAL_STORAGE</code>. Crucially sets <code>android:usesCleartextTraffic="true"</code> so browsers can access local HTTP endpoints without SSL handshake errors.
                </span>
              )}
              {selectedFile.name.includes('build.gradle') && (
                <span>
                  Uses modern Android Gradle Plugin 8+ conventions, Java 17 compatibility, and imports lightweight <code>org.nanohttpd:nanohttpd:2.3.1</code> and <code>gson:2.10.1</code> for JSON serialization.
                </span>
              )}
              {selectedFile.name === 'MainActivity.java' && (
                <span>
                  Uses <code>registerForActivityResult</code> with <code>RequestMultiplePermissions</code> contract instead of deprecated <code>requestPermissions()</code>. Detects active IP addresses via <code>NetworkInterface.getNetworkInterfaces()</code> to support both Wi-Fi routers and portable Wi-Fi Hotspots.
                </span>
              )}
              {selectedFile.name === 'MediaServer.java' && (
                <span>
                  Implements <strong>HTTP 206 Partial Content (Range header)</strong> support. Without Range headers, HTML5 video players and audio seek bars freeze or restart from 0:00 when seeking. Also embeds the complete HTML/JS Web Dashboard in a single self-contained string.
                </span>
              )}
              {selectedFile.name === 'activity_main.xml' && (
                <span>
                  Constructed with Material 3 components (<code>MaterialCardView</code>, <code>MaterialButton</code>, <code>MaterialToolbar</code>) and clean elevation/border styling for a modern look.
                </span>
              )}
              {selectedFile.name === 'build-apk.yml' && (
                <span>
                  GitHub Actions workflow that checks out the repo, sets up Temurin JDK 17 with Gradle caching, grants permissions to <code>./gradlew</code>, builds the debug APK, and uploads it to GitHub artifacts.
                </span>
              )}
              {!['AndroidManifest.xml', 'MainActivity.java', 'MediaServer.java', 'activity_main.xml', 'build-apk.yml'].includes(selectedFile.name) && !selectedFile.name.includes('build.gradle') && (
                <span>
                  Essential project configuration ensuring error-free compilation and clean styling in Android Studio.
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
