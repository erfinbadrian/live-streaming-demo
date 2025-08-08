class StreamingClient {
  constructor({ idleVideoElement, streamVideoElement, onStatusUpdate }) {
    this.idleVideoElement = idleVideoElement;
    this.streamVideoElement = streamVideoElement;
    this.onStatusUpdate = onStatusUpdate;
    
    // WebRTC and streaming state
    this.peerConnection = null;
    this.pcDataChannel = null;
    this.streamId = null;
    this.sessionId = null;
    this.sessionClientAnswer = null;
    this.statsIntervalId = null;
    this.lastBytesReceived = null;
    this.videoIsPlaying = false;
    this.streamVideoOpacity = 0;
    this.ws = null;
    
    // Set this variable to true to request stream warmup upon connection
    this.stream_warmup = true;
    this.isStreamReady = !this.stream_warmup;

    // API configuration
    this.DID_API = null;
    this.RTCPeerConnection = null;
    
    // Presenter configuration
    this.presenterInputByService = {
      talks: {
        source_url: 'https://clips-presenters.d-id.com/v2/amber/Y5K02DLS4m/9o3E6z8MPD/thumbnail.png',
      },
      clips: {
        presenter_id: 'v2_public_amber@Y5K02DLS4m',
        driver_id: '9o3E6z8MPD',
      },
    };

    this.init();
  }

  // Initialize the client
  async init() {
    try {
      // Load API configuration
      const fetchJsonFile = await fetch('./api.json');
      this.DID_API = await fetchJsonFile.json();
      
      if (this.DID_API.key === '🤫') {
        alert('Please put your api key inside ./api.json and restart..');
        return;
      }

      // Set up WebRTC
      this.RTCPeerConnection = (
        window.RTCPeerConnection ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection
      ).bind(window);

      // Set video attributes
      if (this.idleVideoElement) {
        this.idleVideoElement.setAttribute('playsinline', '');
      }
      if (this.streamVideoElement) {
        this.streamVideoElement.setAttribute('playsinline', '');
      }

      // Set presenter type
      this.PRESENTER_TYPE = this.DID_API.service === 'clips' ? 'clip' : 'talk';
      
      console.log('StreamingClient initialized successfully');
    } catch (error) {
      console.error('Failed to initialize StreamingClient:', error);
    }
  }

  // Connect to the streaming service
  async connect() {
    if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
      return;
    }

    this.stopAllStreams();
    this.closePC();

    try {
      // Step 1: Connect to WebSocket
      this.ws = await this.connectToWebSocket(this.DID_API.websocketUrl, this.DID_API.key);

      // Step 2: Send "init-stream" message to WebSocket
      const startStreamMessage = {
        type: 'init-stream',
        payload: {
          ...this.presenterInputByService[this.DID_API.service],
          presenter_type: this.PRESENTER_TYPE,
        },
      };
      this.sendMessage(this.ws, startStreamMessage);

      // Step 3: Handle WebSocket responses by message type
      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        switch (data.messageType) {
          case 'init-stream':
            const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = data;
            this.streamId = newStreamId;
            this.sessionId = newSessionId;
            console.log('init-stream', newStreamId, newSessionId);
            try {
              this.sessionClientAnswer = await this.createPeerConnection(offer, iceServers);
              // Step 4: Send SDP answer to WebSocket
              const sdpMessage = {
                type: 'sdp',
                payload: {
                  answer: this.sessionClientAnswer,
                  session_id: this.sessionId,
                  presenter_type: this.PRESENTER_TYPE,
                },
              };
              this.sendMessage(this.ws, sdpMessage);
            } catch (e) {
              console.error('Error during streaming setup', e);
              this.stopAllStreams();
              this.closePC();
              return;
            }
            break;

          case 'sdp':
            console.log('SDP message received:', event.data);
            break;

          case 'delete-stream':
            console.log('Stream deleted:', event.data);
            break;
        }
      };
    } catch (error) {
      console.error('Failed to connect and set up stream:', error.type);
    }
  }

  // Stream word functionality
  async streamWord() {
    if (!this.ws || !this.sessionId || !this.streamId) {
      console.error('WebSocket connection not established. Please connect first.');
      return;
    }

    const text = 'Halooo , saya silvia, agent kamu';
    const text2 = 'Kamu adalah Silvia,Customer Service AI untuk perumahan Sinarmas Land.';

    let chunks = text.split(' ');
    chunks.push('<break time="3s" />'); // Note : ssml part tags should be grouped together to be sent on the same chunk
    chunks.push(...text2.split(' '));

    // Indicates end of text stream
    chunks.push('');

    for (const [index, chunk] of chunks.entries()) {
      const streamMessage = {
        type: 'stream-text',
        payload: {
          script: {
            type: 'text',
            input: chunk + ' ',
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-JennyNeural',
            },
            ssml: true,
          },
          config: {
            stitch: true,
          },
          apiKeysExternal: {
            elevenlabs: { key: '' },
          },
          background: {
            color: '#FFFFFF',
          },
          index, // Note : add index to track the order of the chunks (better performance), optional field
          session_id: this.sessionId,
          stream_id: this.streamId,
          presenter_type: this.PRESENTER_TYPE,
        },
      };

      this.sendMessage(this.ws, streamMessage);
    }
  }

  // Stream audio functionality
  async streamAudio() {
    if (!this.ws || !this.sessionId || !this.streamId) {
      console.error('WebSocket connection not established. Please connect first.');
      return;
    }

    // Note : we use elevenlabs to stream pcm chunks, you can use any other provider
    const elevenKey = this.DID_API.elevenlabsKey;
    if (!elevenKey) {
      const errorMessage = 'Please put your elevenlabs key inside ./api.json and restart..';
      alert(errorMessage);
      console.error(errorMessage);
      return;
    }

    const stream = async (text, voiceId = 'iWydkXKoiVtvdn4vLKp9') => {
      console.log(text, voiceId);
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=pcm_16000`,
        {
          method: 'POST',
          headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5' }),
          // Please see the list of available models here - https://docs.d-id.com/reference/tts-elevenlabs#%EF%B8%8F-voice-config
        }
      );

      return response.body;
    };

    const streamText = 'Kamu adalah Silvia,Customer Service AI untuk perumahan Sinarmas Land.';

    const activeStream = await stream(streamText);
    let i = 0;
    // Note: PCM chunks
    for await (const chunk of activeStream) {
      // Imporatnt Note : 30KB is the max chunk size + keep max concurrent requests up to 300, adjust chunk size as needed
      const splitted = this.splitArrayIntoChunks([...chunk], 10000); // chunk size: 10KB
      for (const [_, chunk] of splitted.entries()) {
        this.sendStreamMessage([...chunk], i++);
      }
    }
    this.sendStreamMessage(Array.from(new Uint8Array(0)), i);
    console.log('done', i);
  }

  // Destroy the connection
  destroy() {
    if (this.ws && this.sessionId && this.streamId) {
      const streamMessage = {
        type: 'delete-stream',
        payload: {
          session_id: this.sessionId,
          stream_id: this.streamId,
        },
      };
      this.sendMessage(this.ws, streamMessage);
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.stopAllStreams();
    this.closePC();
  }

  // WebRTC event handlers
  onIceGatheringStateChange = () => {
    this.updateStatus('iceGathering', this.peerConnection.iceGatheringState);
  };

  onIceCandidate = (event) => {
    console.log('onIceCandidate', event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
      this.sendMessage(this.ws, {
        type: 'ice',
        payload: {
          session_id: this.sessionId,
          candidate,
          sdpMid,
          sdpMLineIndex,
        },
      });
    } else {
      this.sendMessage(this.ws, {
        type: 'ice',
        payload: {
          stream_id: this.streamId,
          session_id: this.sessionId,
          presenter_type: this.PRESENTER_TYPE,
        },
      });
    }
  };

  onIceConnectionStateChange = () => {
    this.updateStatus('ice', this.peerConnection.iceConnectionState);
    if (this.peerConnection.iceConnectionState === 'failed' || this.peerConnection.iceConnectionState === 'closed') {
      this.stopAllStreams();
      this.closePC();
    }
  };

  onConnectionStateChange = () => {
    // not supported in firefox
    this.updateStatus('peer', this.peerConnection.connectionState);
    console.log('peerConnection', this.peerConnection.connectionState);

    if (this.peerConnection.connectionState === 'connected') {
      this.playIdleVideo();
      /**
       * A fallback mechanism: if the 'stream/ready' event isn't received within 5 seconds after asking for stream warmup,
       * it updates the UI to indicate that the system is ready to start streaming data.
       */
      setTimeout(() => {
        if (!this.isStreamReady) {
          console.log('forcing stream/ready');
          this.isStreamReady = true;
          this.updateStatus('streamEvent', 'ready');
        }
      }, 5000);
    }
  };

  onSignalingStateChange = () => {
    this.updateStatus('signaling', this.peerConnection.signalingState);
  };

  onVideoStatusChange = (videoIsPlaying, stream) => {
    let status;

    if (videoIsPlaying) {
      status = 'streaming';
      this.streamVideoOpacity = this.isStreamReady ? 1 : 0;
      this.setStreamVideoElement(stream);
    } else {
      status = 'empty';
      this.streamVideoOpacity = 0;
    }

    if (this.streamVideoElement) {
      this.streamVideoElement.style.opacity = this.streamVideoOpacity;
    }
    if (this.idleVideoElement) {
      this.idleVideoElement.style.opacity = 1 - this.streamVideoOpacity;
    }

    this.updateStatus('streaming', status);
  };

  onTrack = (event) => {
    /**
     * The following code is designed to provide information about wether currently there is data
     * that's being streamed - It does so by periodically looking for changes in total stream data size
     *
     * This information in our case is used in order to show idle video while no video is streaming.
     * To create this idle video use the POST https://api.d-id.com/talks (or clips) endpoint with a silent audio file or a text script with only ssml breaks
     * https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#break-tag
     * for seamless results use `config.fluent: true` and provide the same configuration as the streaming video
     */

    if (!event.track) return;

    this.statsIntervalId = setInterval(async () => {
      const stats = await this.peerConnection.getStats(event.track);
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          console.log('peerConnection', report);
          const videoStatusChanged = this.videoIsPlaying !== report.bytesReceived > this.lastBytesReceived;

          if (videoStatusChanged) {
            this.videoIsPlaying = report.bytesReceived > this.lastBytesReceived;
            console.log('videoIsPlaying', JSON.stringify(report));
            this.onVideoStatusChange(this.videoIsPlaying, event.streams[0]);
          }
          this.lastBytesReceived = report.bytesReceived;
        }
      });
    }, 500);
  };

  onStreamEvent = (message) => {
    /**
     * This function handles stream events received on the data channel.
     * The 'stream/ready' event received on the data channel signals the end of the 2sec idle streaming.
     * Upon receiving the 'ready' event, we can display the streamed video if one is available on the stream channel.
     * Until the 'ready' event is received, we hide any streamed video.
     * Additionally, this function processes events for stream start, completion, and errors. Other data events are disregarded.
     */

    if (this.pcDataChannel.readyState === 'open') {
      let status;
      const [event, _] = message.data.split(':');

      switch (event) {
        case 'stream/started':
          status = 'started';
          break;
        case 'stream/done':
          status = 'done';
          break;
        case 'stream/ready':
          status = 'ready';
          break;
        case 'stream/error':
          status = 'error';
          break;
        default:
          status = 'dont-care';
          break;
      }

      // Set stream ready after a short delay, adjusting for potential timing differences between data and stream channels
      if (status === 'ready') {
        setTimeout(() => {
          console.log('stream/ready');
          this.isStreamReady = true;
          this.updateStatus('streamEvent', 'ready');
        }, 1000);
      } else {
        console.log(event);
        this.updateStatus('streamEvent', status === 'dont-care' ? event : status);
      }
    }
  };

  // Helper methods
  async createPeerConnection(offer, iceServers) {
    if (!this.peerConnection) {
      console.log(offer, iceServers);
      this.peerConnection = new this.RTCPeerConnection({ iceServers });
      this.pcDataChannel = this.peerConnection.createDataChannel('JanusDataChannel');
      this.peerConnection.addEventListener('icegatheringstatechange', this.onIceGatheringStateChange, true);
      this.peerConnection.addEventListener('icecandidate', this.onIceCandidate, true);
      this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange, true);
      this.peerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange, true);
      this.peerConnection.addEventListener('signalingstatechange', this.onSignalingStateChange, true);
      this.peerConnection.addEventListener('track', this.onTrack, true);
      this.pcDataChannel.addEventListener('message', this.onStreamEvent, true);
    }

    await this.peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');

    const sessionClientAnswer = await this.peerConnection.createAnswer();
    console.log('create local sdp OK');

    await this.peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');

    return sessionClientAnswer;
  }

  setStreamVideoElement(stream) {
    if (!stream || !this.streamVideoElement) return;
    console.log('setStreamVideoElement', stream);
    this.streamVideoElement.srcObject = stream;
    this.streamVideoElement.loop = false;
    this.streamVideoElement.muted = !this.isStreamReady;

    // safari hotfix
    if (this.streamVideoElement.paused) {
      this.streamVideoElement
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }

  playIdleVideo() {
    if (!this.idleVideoElement) return;
    this.idleVideoElement.src = this.DID_API.service === 'clips' ? '/cewe_idle.mp4' : '/emma_idle.mp4';
  }

  stopAllStreams() {
    if (this.streamVideoElement && this.streamVideoElement.srcObject) {
      console.log('stopping video streams');
      this.streamVideoElement.srcObject.getTracks().forEach((track) => track.stop());
      this.streamVideoElement.srcObject = null;
      this.streamVideoOpacity = 0;
    }
  }

  closePC(pc = this.peerConnection) {
    if (!pc) return;
    console.log('stopping peer connection');
    pc.close();
    pc.removeEventListener('icegatheringstatechange', this.onIceGatheringStateChange, true);
    pc.removeEventListener('icecandidate', this.onIceCandidate, true);
    pc.removeEventListener('iceconnectionstatechange', this.onIceConnectionStateChange, true);
    pc.removeEventListener('connectionstatechange', this.onConnectionStateChange, true);
    pc.removeEventListener('signalingstatechange', this.onSignalingStateChange, true);
    pc.removeEventListener('track', this.onTrack, true);
    if (this.pcDataChannel) {
      this.pcDataChannel.removeEventListener('message', this.onStreamEvent, true);
    }

    clearInterval(this.statsIntervalId);
    this.isStreamReady = !this.stream_warmup;
    this.streamVideoOpacity = 0;
    this.updateStatus('iceGathering', '');
    this.updateStatus('signaling', '');
    this.updateStatus('ice', '');
    this.updateStatus('peer', '');
    this.updateStatus('streamEvent', '');
    console.log('stopped peer connection');
    if (pc === this.peerConnection) {
      this.peerConnection = null;
    }
  }

  async connectToWebSocket(url, token) {
    return new Promise((resolve, reject) => {
      const wsUrl = `${url}?authorization=Basic ${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection opened.');
        resolve(ws);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        reject(err);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed.');
      };
    });
  }

  sendMessage(ws, message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not available or not open. Cannot send message.');
    }
  }

  sendStreamMessage(input, index) {
    if (!this.ws || !this.sessionId || !this.streamId) {
      console.error('WebSocket connection not established. Cannot send stream message.');
      return;
    }

    const streamMessage = {
      type: 'stream-audio',
      payload: {
        script: {
          type: 'audio',
          input,
        },
        config: {
          stitch: true,
        },
        background: {
          color: '#FFFFFF',
        },
        index, // Note : add index to track the order of the chunks (better performance), optional field
        session_id: this.sessionId,
        stream_id: this.streamId,
        presenter_type: this.PRESENTER_TYPE,
      },
    };

    this.sendMessage(this.ws, streamMessage);
  }

  splitArrayIntoChunks(array, size) {
    if (!Array.isArray(array)) {
      throw new TypeError('Input should be an array');
    }
    if (typeof size !== 'number' || size <= 0) {
      throw new TypeError('Size should be a positive number');
    }

    const result = [];
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size);
      result.push(chunk);
    }
    return result;
  }

  updateStatus(key, value) {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(prevStatus => ({
        ...prevStatus,
        [key]: value
      }));
    }
  }
}

export default StreamingClient; 