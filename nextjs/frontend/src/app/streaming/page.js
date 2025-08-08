'use client';

import { useEffect, useRef, useState } from 'react';
import StreamingClient from '../utils/streaming-client';

export default function StreamingPage() {
  const idleVideoRef = useRef(null);
  const streamVideoRef = useRef(null);
  const [streamingClient, setStreamingClient] = useState(null);
  const [status, setStatus] = useState({
    iceGathering: '',
    ice: '',
    peer: '',
    signaling: '',
    streaming: '',
    streamEvent: ''
  });

  useEffect(() => {
    // Initialize streaming client
    const client = new StreamingClient({
      idleVideoElement: idleVideoRef.current,
      streamVideoElement: streamVideoRef.current,
      onStatusUpdate: setStatus
    });
    setStreamingClient(client);

    return () => {
      client?.destroy();
    };
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
      <style jsx>{`
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
      
      <div className="font-mulish text-center">
        <div className="w-[820px] relative mx-auto">
          <div 
            className="bg-[url('/bg.png')] h-[500px] bg-top"
            style={{ backgroundImage: 'url(/bg.png)' }}
          >
            <div className="relative h-full w-[400px] mx-auto bg-red-500">
              <video
                ref={idleVideoRef}
                id="idle-video-element"
                width="400"
                height="400"
                autoPlay
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover rounded-full bg-white opacity-100"
              />
              <video
                ref={streamVideoRef}
                id="stream-video-element"
                width="400"
                height="400"
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover rounded-full bg-white opacity-0"
              />
            </div>
          </div>
          
          <br />

          <div className="clear-both p-0 text-center">
            <button
              onClick={handleConnect}
              className="px-5 py-2.5 rounded border-none text-base mx-1.5 bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out"
            >
              Connect
            </button>
            <button
              onClick={handleStreamWord}
              className="px-5 py-2.5 rounded border-none text-base mx-1.5 bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out"
            >
              Stream word
            </button>
            <button
              onClick={handleStreamAudio}
              className="px-5 py-2.5 rounded border-none text-base mx-1.5 bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out"
            >
              Stream audio
            </button>
            <button
              onClick={handleDestroy}
              className="px-5 py-2.5 rounded border-none text-base mx-1.5 bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out"
            >
              Destroy
            </button>
          </div>

          <div className="clear-both pt-5 text-left inline-block leading-[140%] text-[15px]">
            <div className="pb-2.5">
              ICE gathering status: <label className={`iceGatheringState-${status.iceGathering}`}>{status.iceGathering}</label><br />
            </div>
            <div className="pb-2.5">
              ICE status: <label className={`iceConnectionState-${status.ice}`}>{status.ice}</label><br />
            </div>
            <div className="pb-2.5">
              Peer connection status: <label className={`peerConnectionState-${status.peer}`}>{status.peer}</label><br />
            </div>
            <div className="pb-2.5">
              Signaling status: <label className={`signalingState-${status.signaling}`}>{status.signaling}</label><br />
            </div>
            <div className="pb-2.5">
              Last stream event: <label className={`streamEvent-${status.streamEvent}`}>{status.streamEvent}</label><br />
            </div>
            <div className="pb-2.5">
              Streaming status: <label className={`streamingState-${status.streaming}`}>{status.streaming}</label><br />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 