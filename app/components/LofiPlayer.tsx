'use client';

import React, { useEffect, useState, useRef } from 'react';

// Declarations for TypeScript environments to prevent Window errors
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface AppSettings {
  theme: 'midnight' | 'cyberpunk' | 'forest';
  volume: number;
  isMuted: boolean;
  zenMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'midnight',
  volume: 50,
  isMuted: false,
  zenMode: false,
};

// Theme Tailwind configuration maps
const themeStyles = {
  midnight: { bg: 'bg-[#0f0f23]/80', border: 'border-purple-900/40', accent: 'bg-purple-600 hover:bg-purple-500', text: 'text-purple-400' },
  cyberpunk: { bg: 'bg-[#120e16]/80', border: 'border-yellow-500/40', accent: 'bg-yellow-500 hover:bg-yellow-400 text-black', text: 'text-yellow-400' },
  forest: { bg: 'bg-[#0b1411]/80', border: 'border-emerald-800/40', accent: 'bg-emerald-600 hover:bg-emerald-500', text: 'text-emerald-400' }
};

// 1. Added the Props interface to accept the videoId from the Parent Dashboard
interface Props { 
  videoId: string; 
}

export default function LofiPlayer({ videoId }: Props) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isMounted, setIsMounted] = useState(false);
  const [playerState, setPlayerState] = useState<string>('Connecting...');
  
  const playerRef = useRef<any>(null);
  const iframeContainerId = 'youtube-player-element';

  // Safe localStorage Initialization (Prevents Next.js Hydration Errors)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('lofi-space-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local configurations", e);
      }
    }
  }, []);

  // Persist configurations when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('lofi-space-settings', JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  // YouTube API Dynamic Script Loading
  useEffect(() => {
    if (!isMounted) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [isMounted]);

  // 2. NEW: Watch for videoId prop changes to switch video dynamically from the library
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player(iframeContainerId, {
      height: '100%',
      width: '100%',
      videoId: videoId, // 3. Replaced hardcoded ID with the dynamic prop
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event: any) => {
    setPlayerState('Ready');
    event.target.setVolume(settings.volume);
    if (settings.isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
  };

  const onPlayerStateChange = (event: any) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setPlayerState('Live');
        break;
      case window.YT.PlayerState.PAUSED:
        setPlayerState('Paused');
        break;
      case window.YT.PlayerState.BUFFERING:
        setPlayerState('Buffering...');
        break;
      default:
        setPlayerState('Ready');
    }
  };

  // Execution Handlers
  const togglePlay = () => {
    if (!playerRef.current) return;
    const currentState = playerRef.current.getPlayerState();
    if (currentState === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(e.target.value, 10);
    setSettings(prev => ({ ...prev, volume }));
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  };

  const toggleMute = () => {
    const nextMute = !settings.isMuted;
    setSettings(prev => ({ ...prev, isMuted: nextMute }));
    if (playerRef.current) {
      nextMute ? playerRef.current.mute() : playerRef.current.unMute();
    }
  };

  if (!isMounted) return <div className="text-gray-500 animate-pulse">Loading interface profile...</div>;

  const activeTheme = themeStyles[settings.theme] || themeStyles.midnight;

  return (
    <div className={`relative flex flex-col items-center w-full max-w-4xl transition-all duration-500`}>
      
      {/* Upper Navigation/Options Bar */}
      {!settings.zenMode && (
        <div className="flex w-full justify-between items-center mb-6 px-4 animate-fadeIn">
          <h1 className={`text-xl font-mono tracking-widest uppercase ${activeTheme.text}`}>
            LOFI.SPACE // JAZZ
          </h1>
          
          {/* Theme Selector UI */}
          <div className="flex gap-2 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
            {(Object.keys(themeStyles) as Array<keyof typeof themeStyles>).map((t) => (
              <button
                key={t}
                onClick={() => setSettings(prev => ({ ...prev, theme: t }))}
                className={`px-3 py-1 text-xs rounded transition-all capitalize ${
                  settings.theme === t ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden border ${activeTheme.border} shadow-2xl transition-all duration-300`}>
        
        {/* Underlay Video Context */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none scale-105">
          <div id={iframeContainerId} />
        </div>

        {/* Custom Aesthetic Screen Overlay */}
        <div 
          className={`absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500 bg-linear-to-t from-black/90 via-black/20 to-black/40 ${
            settings.zenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
        >
          {/* Status Metric Top Layer */}
          <div className="flex justify-between items-start">
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 border border-zinc-800">
              <span className={`w-2 h-2 rounded-full ${playerState === 'Live' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              {playerState}
            </span>
            
            <button
              onClick={() => setSettings(prev => ({ ...prev, zenMode: !prev.zenMode }))}
              className="bg-black/60 backdrop-blur-md hover:bg-zinc-900 text-xs px-3 py-1 rounded-md text-zinc-300 border border-zinc-800 transition-colors"
            >
              {settings.zenMode ? 'Exit Zen' : 'Zen Mode'}
            </button>
          </div>

          {/* Bottom Interactive Dashboard Controller Container */}
          <div className={`${activeTheme.bg} backdrop-blur-xl p-4 rounded-xl border ${activeTheme.border} flex flex-wrap gap-4 items-center justify-between shadow-lg`}>
            
            {/* Playback Control Trigger Group */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md transform active:scale-95 ${activeTheme.accent}`}
              >
                {playerState === 'Live' ? 'Pause' : 'Listen'}
              </button>
              
              <button
                onClick={toggleMute}
                className="bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                {settings.isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>

            {/* Custom Range Range Slider Control Block */}
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-50">
              <span className="text-xs text-zinc-400 font-mono">VOL</span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.isMuted ? 0 : settings.volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-xs text-zinc-400 font-mono w-6 text-right">
                {settings.isMuted ? 0 : settings.volume}%
              </span>
            </div>

          </div>
        </div>
      </div>
      
      {settings.zenMode && (
        <p className="text-xs text-zinc-600 mt-4 font-mono transition-opacity duration-300">
          Hover over workspace interface to reveal parameters.
        </p>
      )}
    </div>
  );
}