'use client';

import { useEffect, useRef, useState } from 'react';
import AgentsClient from '../utils/agents-client';

export default function AgentsPage() {
  const videoRef = useRef(null);
  const textAreaRef = useRef(null);
  const [agentsClient, setAgentsClient] = useState(null);
  const [status, setStatus] = useState({
    iceGathering: '',
    ice: '',
    peer: '',
    signaling: '',
    streaming: ''
  });
  const [agentData, setAgentData] = useState({
    agentId: '',
    chatId: ''
  });
  const [msgHistory, setMsgHistory] = useState('');

  useEffect(() => {
    // Initialize agents client
    const client = new AgentsClient({
      videoElement: videoRef.current,
      onStatusUpdate: setStatus,
      onAgentDataUpdate: setAgentData,
      onMessageUpdate: setMsgHistory
    });
    setAgentsClient(client);

    return () => {
      client?.destroy();
    };
  }, []);

  const handleCreateAgent = async () => {
    try {
      await agentsClient?.createAgentWorkflow();
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleConnect = () => {
    agentsClient?.connect();
  };

  const handleStart = () => {
    const message = textAreaRef.current?.value;
    if (message) {
      agentsClient?.sendMessage(message);
      textAreaRef.current.value = '';
    }
  };

  const handleDestroy = () => {
    agentsClient?.destroy();
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

        .animated {
          animation: fadeInOut 1s ease-in-out;
        }

        @keyframes fadeInOut {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <div className="font-mulish text-center min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">D-ID Agents Demo</h1>
          
          {/* Video Section */}
          <div className="mb-8">
            <div className="relative mx-auto w-[400px] h-[400px] bg-gray-200 rounded-full overflow-hidden">
              <video
                ref={videoRef}
                id="video-element"
                width="400"
                height="400"
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Buttons Section */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleCreateAgent}
                className="px-6 py-3 rounded-lg border-none text-base bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer transition-all duration-200 ease-out"
              >
                Create new Agent with Knowledge
              </button>
              <button
                onClick={handleConnect}
                className="px-6 py-3 rounded-lg border-none text-base bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out"
              >
                Connect
              </button>
              <button
                onClick={handleDestroy}
                className="px-6 py-3 rounded-lg border-none text-base bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer transition-all duration-200 ease-out"
              >
                Destroy
              </button>
            </div>

            {/* Message Input */}
            <div className="flex gap-4 justify-center items-center">
              <textarea
                ref={textAreaRef}
                placeholder="Type your message here..."
                className="w-80 h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7459fe]"
              />
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-lg border-none text-base bg-[#7459fe] text-white hover:bg-[#9480ff] hover:cursor-pointer transition-all duration-200 ease-out h-fit"
              >
                Send
              </button>
            </div>
          </div>

          {/* Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Connection Status */}
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Connection Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  Agent ID: <span className="font-mono text-blue-600">{agentData.agentId || 'Not set'}</span>
                </div>
                <div>
                  Chat ID: <span className="font-mono text-blue-600">{agentData.chatId || 'Not set'}</span>
                </div>
                <div>
                  ICE gathering status: <span className={`iceGatheringState-${status.iceGathering}`}>{status.iceGathering}</span>
                </div>
                <div>
                  ICE status: <span className={`iceConnectionState-${status.ice}`}>{status.ice}</span>
                </div>
                <div>
                  Peer connection status: <span className={`peerConnectionState-${status.peer}`}>{status.peer}</span>
                </div>
                <div>
                  Signaling status: <span className={`signalingState-${status.signaling}`}>{status.signaling}</span>
                </div>
                <div>
                  Streaming status: <span className={`streamingState-${status.streaming}`}>{status.streaming}</span>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Message History</h3>
              <div 
                className="h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto text-sm"
                dangerouslySetInnerHTML={{ __html: msgHistory }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Click "Create new Agent with Knowledge" to set up the AI agent</li>
              <li>Wait for the process to complete (check console for progress)</li>
              <li>Click "Connect" to establish the video connection</li>
              <li>Type a message and click "Send" to interact with the agent</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
} 