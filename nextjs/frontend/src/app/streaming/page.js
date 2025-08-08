'use client';

import { useEffect, useRef, useState } from 'react';
import StreamingClient from '../utils/streaming-client';

export default function StreamingPage() {
  const idleVideoRef = useRef(null);
  const streamVideoRef = useRef(null);
  const [streamingClient, setStreamingClient] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [status, setStatus] = useState({
    iceGathering: '',
    ice: '',
    peer: '',
    signaling: '',
    streaming: '',
    streamEvent: '',
  });

  useEffect(() => {
    // Ensure body and html take full height for fullscreen
    document.documentElement.style.height = '100%';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      // Cleanup styles on unmount
      document.documentElement.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Set idle video source immediately on mount with error handling
    if (idleVideoRef.current) {
      const video = idleVideoRef.current;

      // Add event listeners for debugging
      const handleLoadedData = () => {
        console.log('Idle video loaded successfully');
        setVideoLoaded(true);
        setVideoError(null);
      };

      const handleError = (e) => {
        console.error('Idle video failed to load:', e);
        setVideoError('Failed to load video');
        setVideoLoaded(false);
      };

      const handleCanPlay = () => {
        console.log('Idle video can play');
        video.play().catch((err) => console.warn('Autoplay prevented:', err));
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);

      // Set video source
      video.src = '/cewe_idle.mp4';
      video.load(); // Force reload

      // Cleanup listeners
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  useEffect(() => {
    // Initialize streaming client after video is ready
    if (idleVideoRef.current && streamVideoRef.current) {
      const client = new StreamingClient({
        idleVideoElement: idleVideoRef.current,
        streamVideoElement: streamVideoRef.current,
        onStatusUpdate: setStatus,
      });
      setStreamingClient(client);

      return () => {
        client?.destroy();
      };
    }
  }, []);

  const handleConnect = () => {
    streamingClient?.connect();
  };

  const handleStreamWord = () => {
    streamingClient?.streamWord();
  };

  const handleStreamAudio = () => {
    streamingClient?.streamAudio();
  };

  const handleDestroy = () => {
    streamingClient?.destroy();
  };

  return (
    <>
      <style jsx global>{`
        /* Ensure fullscreen layout */
        html,
        body {
          height: 100vh !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        #__next {
          height: 100vh !important;
          width: 100vw !important;
        }

        .peerConnectionState-new {
          color: cornflowerblue;
        }
        .peerConnectionState-connecting {
          color: orange;
        }
        .peerConnectionState-connected {
          color: green;
        }
        .peerConnectionState-disconnected,
        .peerConnectionState-closed,
        .peerConnectionState-failed {
          color: red;
        }

        .iceConnectionState-new {
          color: cornflowerblue;
        }
        .iceConnectionState-checking {
          color: orange;
        }
        .iceConnectionState-connected,
        .iceConnectionState-completed {
          color: green;
        }
        .iceConnectionState-disconnected,
        .iceConnectionState-closed,
        .iceConnectionState-failed {
          color: red;
        }

        .iceGatheringState-new {
          color: cornflowerblue;
        }
        .iceGatheringState-gathering {
          color: orange;
        }
        .iceGatheringState-complete {
          color: black;
        }

        .signalingState-stable {
          color: green;
        }
        .signalingState-have-local-offer,
        .signalingState-have-remote-offer,
        .signalingState-have-local-pranswer,
        .signalingState-have-remote-pranswer {
          color: cornflowerblue;
        }
        .signalingState-closed {
          color: red;
        }

        .streamingState-streaming {
          color: green;
        }

        .streamingState-empty {
          color: grey;
        }

        .streamEvent-started {
          color: green;
        }

        .streamEvent-done {
          color: orange;
        }

        .streamEvent-ready {
          color: green;
        }

        .streamEvent-error {
          color: red;
        }

        .streamEvent-dont-care {
          color: gray;
        }
      `}</style>

      {/* Fullscreen container with explicit dimensions */}
      <div
        className="fixed inset-0 bg-black font-mulish"
        style={{
          height: '100vh',
          width: '100vw',
          top: 0,
          left: 0,
          zIndex: 9999,
          position: 'fixed',
        }}
      >
        {/* Video container - fullscreen */}
        <div className="relative w-full h-full" style={{ height: '100vh', width: '100vw' }}>
          {/* Idle video */}
          <video
            ref={idleVideoRef}
            id="idle-video-element"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              display: videoLoaded ? 'block' : 'none',
              height: '100vh',
              width: '100vw',
            }}
          />

          {/* Stream video */}
          <video
            ref={streamVideoRef}
            id="stream-video-element"
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            style={{
              height: '100vh',
              width: '100vw',
            }}
          />

          {/* Loading/Error state */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-xl">Loading video...</div>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-red-400 text-xl">{videoError}</div>
            </div>
          )}

          {/* Status overlay - top left */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-sm rounded-lg p-4 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="text-xs text-gray-300 mb-2">
                Video: {videoLoaded ? '✅ Loaded' : videoError ? '❌ Error' : '⏳ Loading'}
              </div>
              <div>
                ICE gathering: <span className={`iceGatheringState-${status.iceGathering}`}>{status.iceGathering}</span>
              </div>
              <div>
                ICE status: <span className={`iceConnectionState-${status.ice}`}>{status.ice}</span>
              </div>
              <div>
                Peer connection: <span className={`peerConnectionState-${status.peer}`}>{status.peer}</span>
              </div>
              <div>
                Signaling: <span className={`signalingState-${status.signaling}`}>{status.signaling}</span>
              </div>
              <div>
                Stream event: <span className={`streamEvent-${status.streamEvent}`}>{status.streamEvent}</span>
              </div>
              <div>
                Streaming: <span className={`streamingState-${status.streaming}`}>{status.streaming}</span>
              </div>
            </div>
          </div>

          {/* Controls overlay - bottom center */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center" style={{ bottom: '50px' }}>
            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
              {/* Connect Button */}
              <button
                onClick={handleConnect}
                className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-400/30"
              >
                <span className="relative z-10">Connect</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>

              {/* Stream Word Button */}
              <button
                onClick={handleStreamWord}
                className="relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/30"
              >
                <span className="relative z-10">Stream Word</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>

              {/* Stream Audio Button */}
              <button
                onClick={handleStreamAudio}
                className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 border border-purple-400/30"
              >
                <span className="relative z-10">Stream Audio</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>

              {/* Destroy Button */}
              <button
                onClick={handleDestroy}
                className="relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 border border-red-400/30"
              >
                <span className="relative z-10">Destroy</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 