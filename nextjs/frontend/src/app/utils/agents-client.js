// Import axios dynamically for client-side usage
let axios;
if (typeof window !== 'undefined') {
  import('axios').then(module => {
    axios = module.default;
  });
}

class AgentsClient {
  constructor({ videoElement, onStatusUpdate, onAgentDataUpdate, onMessageUpdate }) {
    this.videoElement = videoElement;
    this.onStatusUpdate = onStatusUpdate;
    this.onAgentDataUpdate = onAgentDataUpdate;
    this.onMessageUpdate = onMessageUpdate;
    
    // WebRTC and streaming state
    this.peerConnection = null;
    this.streamId = null;
    this.sessionId = null;
    this.sessionClientAnswer = null;
    this.statsIntervalId = null;
    this.lastBytesReceived = null;
    this.videoIsPlaying = false;
    this.agentId = '';
    this.chatId = '';

    // API configuration
    this.DID_API = null;
    this.RTCPeerConnection = null;

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
      if (this.videoElement) {
        this.videoElement.setAttribute('playsinline', '');
      }

      // Play idle video when initialized
      this.playIdleVideo();

      // Check if agent IDs are already set
      if (!this.agentId || this.agentId === '') {
        console.log(
          "Empty 'agentID' and 'chatID' variables\n\n1. Click on the 'Create new Agent with Knowledge' button\n2. Open the Console and wait for the process to complete\n3. Press on the 'Connect' button\n4. Type and send a message to the chat\nNOTE: You can store the created 'agentID' and 'chatId' variables for future chats"
        );
      } else {
        console.log(
          "You are good to go!\nClick on the 'Connect Button', Then send a new message\nAgent ID: ",
          this.agentId,
          '\nChat ID: ',
          this.chatId
        );
        this.updateAgentData(this.agentId, this.chatId);
      }
      
      console.log('AgentsClient initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AgentsClient:', error);
    }
  }

  // Connect to the streaming service
  async connect() {
    if (!this.agentId || this.agentId === '') {
      return alert(
        "1. Click on the 'Create new Agent with Knowledge' button\n2. Open the Console and wait for the process to complete\n3. Press on the 'Connect' button\n4. Type and send a message to the chat\nNOTE: You can store the created 'agentID' and 'chatId' variables for future chats"
      );
    }

    if (this.peerConnection && this.peerConnection.connectionState === 'connected') {
      return;
    }

    this.stopAllStreams();
    this.closePC();

    try {
      // WEBRTC API CALL 1 - Create a new stream
      const sessionResponse = await this.fetchWithRetries(`${this.DID_API.url}/${this.DID_API.service}/streams`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/v1_image.jpeg',
        }),
      });

      const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
      this.streamId = newStreamId;
      this.sessionId = newSessionId;

      try {
        this.sessionClientAnswer = await this.createPeerConnection(offer, iceServers);
      } catch (e) {
        console.log('error during streaming setup', e);
        this.stopAllStreams();
        this.closePC();
        return;
      }

      // WEBRTC API CALL 2 - Start a stream
      const sdpResponse = await fetch(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}/sdp`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: this.sessionClientAnswer,
          session_id: this.sessionId,
        }),
      });

      console.log('Connected successfully');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  // Send message to the agent
  async sendMessage(message) {
    // connectionState not supported in firefox
    if (this.peerConnection?.signalingState === 'stable' || this.peerConnection?.iceConnectionState === 'connected') {
      // Update message history
      this.updateMessageHistory(`<span style='opacity:0.5'><u>User:</u> ${message}</span><br>`);

      // Agents Overview - Step 3: Send a Message to a Chat session - Send a message to a Chat
      const playResponse = await this.fetchWithRetries(`${this.DID_API.url}/agents/${this.agentId}/chat/${this.chatId}`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: this.streamId,
          sessionId: this.sessionId,
          messages: [
            {
              role: 'user',
              content: message,
              created_at: new Date().toString(),
            },
          ],
        }),
      });

      const playResponseData = await playResponse.json();
      if (playResponse.status === 200 && playResponseData.chatMode === 'TextOnly') {
        console.log('User is out of credit, API only return text messages');
        this.updateMessageHistory(`<span style='opacity:0.5'> ${playResponseData.result}</span><br>`);
      }
    }
  }

  // Destroy the connection
  async destroy() {
    await fetch(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${this.DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: this.sessionId }),
    });

    this.stopAllStreams();
    this.closePC();
  }

  // Create agent workflow
  async createAgentWorkflow() {
    this.updateAgentData('Processing...', 'Processing...');
    
    // Wait for axios to be loaded
    await new Promise(resolve => {
      const checkAxios = () => {
        if (axios) {
          resolve();
        } else {
          setTimeout(checkAxios, 100);
        }
      };
      checkAxios();
    });

    axios.defaults.baseURL = `${this.DID_API.url}`;
    axios.defaults.headers.common['Authorization'] = `Basic ${this.DID_API.key}`;
    axios.defaults.headers.common['content-type'] = 'application/json';

    try {
      // Retry Mechanism (Polling) for this demo only - Please use Webhooks in real life applications!
      const retry = async (url, retries = 1) => {
        const maxRetryCount = 5; // Maximum number of retries
        const maxDelaySec = 10; // Maximum delay in seconds
        try {
          let response = await axios.get(`${url}`);
          if (response.data.status === 'done') {
            return console.log(response.data.id + ': ' + response.data.status);
          } else {
            throw new Error("Status is not 'done'");
          }
        } catch (err) {
          if (retries <= maxRetryCount) {
            const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

            await new Promise((resolve) => setTimeout(resolve, delay));

            console.log(`Retrying ${retries}/${maxRetryCount}. ${err}`);
            return retry(url, retries + 1);
          } else {
            this.updateAgentData('Failed', 'Failed');
            throw new Error(`Max retries exceeded. error: ${err}`);
          }
        }
      };

      // Knowledge Overview - Step 1: Create a new Knowledge Base
      const createKnowledge = await axios.post('/knowledge', {
        name: 'knowledge',
        description: 'D-ID Agents API',
      });
      console.log('Create Knowledge:', createKnowledge.data);

      let knowledgeId = createKnowledge.data.id;
      console.log('Knowledge ID: ' + knowledgeId);

      // Knowledge Overview - Step 2: Add Documents to the Knowledge Base
      const createDocument = await axios.post(`/knowledge/${knowledgeId}/documents`, {
        documentType: 'pdf',
        source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/Prompt_engineering_Wikipedia.pdf',
        title: 'Prompt Engineering Wikipedia Page PDF',
      });
      console.log('Create Document: ', createDocument.data);

      // Split the # to use in documentID
      let documentId = createDocument.data.id;
      let splitArr = documentId.split('#');
      documentId = splitArr[1];
      console.log('Document ID: ' + documentId);

      // Knowledge Overview - Step 3: Retrieving the Document and Knowledge status
      await retry(`/knowledge/${knowledgeId}/documents/${documentId}`);
      await retry(`/knowledge/${knowledgeId}`);

      // Agents Overview - Step 1: Create an Agent
      const createAgent = await axios.post('/agents', {
        knowledge: {
          provider: 'pinecone',
          embedder: {
            provider: 'azure-open-ai',
            model: 'text-large-003',
          },
          id: knowledgeId,
        },
        presenter: {
          type: 'talk',
          voice: {
            type: 'microsoft',
            voice_id: 'en-US-JennyMultilingualV2Neural',
          },
          thumbnail: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/v1_image.jpeg',
          source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/v1_image.jpeg',
        },
        llm: {
          type: 'openai',
          provider: 'openai',
          model: 'gpt-3.5-turbo-1106',
          instructions: 'Your name is Emma, an AI designed to assist with information about Prompt Engineering and RAG',
          template: 'rag-grounded',
        },
        preview_name: 'Emma',
      });
      console.log('Create Agent: ', createAgent.data);
      let agentId = createAgent.data.id;
      console.log('Agent ID: ' + agentId);

      // Agents Overview - Step 2: Create a new Chat session with the Agent
      const createChat = await axios.post(`/agents/${agentId}/chat`);
      console.log('Create Chat: ', createChat.data);
      let chatId = createChat.data.id;
      console.log('Chat ID: ' + chatId);

      console.log(
        "Create new Agent with Knowledge - DONE!\n Press on the 'Connect' button to proceed.\n Store the created 'agentID' and 'chatId' variables for future chats"
      );
      
      this.agentId = agentId;
      this.chatId = chatId;
      this.updateAgentData(agentId, chatId);
      
      return { agentId, chatId };
    } catch (err) {
      this.updateAgentData('Failed', 'Failed');
      throw new Error(err);
    }
  }

  // WebRTC event handlers
  onIceGatheringStateChange = () => {
    this.updateStatus('iceGathering', this.peerConnection.iceGatheringState);
  };

  onIceCandidate = (event) => {
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

      // WEBRTC API CALL 3 - Submit network information
      fetch(`${this.DID_API.url}/${this.DID_API.service}/streams/${this.streamId}/ice`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: this.sessionId,
        }),
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
  };

  onSignalingStateChange = () => {
    this.updateStatus('signaling', this.peerConnection.signalingState);
  };

  onVideoStatusChange = (videoIsPlaying, stream) => {
    let status;
    if (videoIsPlaying) {
      status = 'streaming';

      const remoteStream = stream;
      this.setVideoElement(remoteStream);
    } else {
      status = 'empty';
      this.playIdleVideo();
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
          const videoStatusChanged = this.videoIsPlaying !== report.bytesReceived > this.lastBytesReceived;

          if (videoStatusChanged) {
            this.videoIsPlaying = report.bytesReceived > this.lastBytesReceived;
            this.onVideoStatusChange(this.videoIsPlaying, event.streams[0]);
          }
          this.lastBytesReceived = report.bytesReceived;
        }
      });
    }, 500);
  };

  // Helper methods
  async createPeerConnection(offer, iceServers) {
    if (!this.peerConnection) {
      this.peerConnection = new this.RTCPeerConnection({ iceServers });
      this.peerConnection.addEventListener('icegatheringstatechange', this.onIceGatheringStateChange, true);
      this.peerConnection.addEventListener('icecandidate', this.onIceCandidate, true);
      this.peerConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange, true);
      this.peerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange, true);
      this.peerConnection.addEventListener('signalingstatechange', this.onSignalingStateChange, true);
      this.peerConnection.addEventListener('track', this.onTrack, true);
    }

    await this.peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');

    const sessionClientAnswer = await this.peerConnection.createAnswer();
    console.log('create local sdp OK');

    await this.peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');

    // Data Channel creation (for displaying the Agent's responses as text)
    let dc = await this.peerConnection.createDataChannel('JanusDataChannel');
    dc.onopen = () => {
      console.log('datachannel open');
    };

    let decodedMsg;
    // Agent Text Responses - Decoding the responses, pasting to the HTML element
    dc.onmessage = (event) => {
      let msg = event.data;
      let msgType = 'chat/answer:';
      if (msg.includes(msgType)) {
        msg = decodeURIComponent(msg.replace(msgType, ''));
        console.log(msg);
        decodedMsg = msg;
        return decodedMsg;
      }
      if (msg.includes('stream/started')) {
        console.log(msg, decodedMsg);
        this.updateMessageHistory(`<span>${decodedMsg}</span><br><br>`);
      } else {
        console.log(msg);
      }
    };

    dc.onclose = () => {
      console.log('datachannel close');
    };

    return sessionClientAnswer;
  }

  setVideoElement(stream) {
    if (!stream || !this.videoElement) return;
    // Add Animation Class
    this.videoElement.classList.add('animated');

    // Removing browsers' autoplay's 'Mute' Requirement
    this.videoElement.muted = false;

    this.videoElement.srcObject = stream;
    this.videoElement.loop = false;

    // Remove Animation Class after it's completed
    setTimeout(() => {
      this.videoElement.classList.remove('animated');
    }, 1000);

    // safari hotfix
    if (this.videoElement.paused) {
      this.videoElement
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }

  playIdleVideo() {
    if (!this.videoElement) return;
    // Add Animation Class
    this.videoElement.classList.toggle('animated');

    this.videoElement.srcObject = undefined;
    this.videoElement.src = '/emma_idle.mp4';
    this.videoElement.loop = true;

    // Remove Animation Class after it's completed
    setTimeout(() => {
      this.videoElement.classList.remove('animated');
    }, 1000);
  }

  stopAllStreams() {
    if (this.videoElement && this.videoElement.srcObject) {
      console.log('stopping video streams');
      this.videoElement.srcObject.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
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
    clearInterval(this.statsIntervalId);
    this.updateStatus('iceGathering', '');
    this.updateStatus('signaling', '');
    this.updateStatus('ice', '');
    this.updateStatus('peer', '');
    console.log('stopped peer connection');
    if (pc === this.peerConnection) {
      this.peerConnection = null;
    }
  }

  async fetchWithRetries(url, options, retries = 1) {
    const maxRetryCount = 3;
    const maxDelaySec = 4;
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

        await new Promise((resolve) => setTimeout(resolve, delay));

        console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
        return this.fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. error: ${err}`);
      }
    }
  }

  updateStatus(key, value) {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(prevStatus => ({
        ...prevStatus,
        [key]: value
      }));
    }
  }

  updateAgentData(agentId, chatId) {
    if (this.onAgentDataUpdate) {
      this.onAgentDataUpdate({ agentId, chatId });
    }
  }

  updateMessageHistory(message) {
    if (this.onMessageUpdate) {
      this.onMessageUpdate(prevHistory => prevHistory + message);
    }
  }
}

export default AgentsClient; 