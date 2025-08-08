# D-ID Avatar Demo - Next.js

A modern web application showcasing D-ID's AI-powered video streaming and intelligent agents capabilities, built with Next.js and React.

## Features

### 🎥 Streaming Demo (`/streaming`)
- Real-time video streaming with WebSocket connections
- Text-to-speech with customizable voices
- Audio streaming with ElevenLabs integration
- Live status monitoring for WebRTC connections
- Dual video display (idle and streaming)

### 🤖 Agents Demo (`/agents`)
- Interactive AI agents with knowledge base integration
- Real-time chat with video responses
- Automated agent creation workflow
- Document-based knowledge integration
- Message history tracking

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Streaming**: WebRTC, WebSockets
- **AI Services**: D-ID API, ElevenLabs
- **HTTP Client**: Axios
- **Fonts**: Google Fonts (Mulish)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- D-ID API key
- ElevenLabs API key (for audio streaming)

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd nextjs/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API credentials:**
   
   Ensure the `api.json` file is present in the `public` folder with your credentials:
   ```json
   {
     "key": "your-d-id-api-key",
     "url": "https://api.d-id.com",
     "websocketUrl": "wss://ws-api.d-id.com",
     "service": "clips",
     "elevenlabsKey": "your-elevenlabs-api-key"
   }
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Streaming Demo

1. Click "Try Streaming" from the home page
2. Click "Connect" to establish WebSocket connection
3. Use "Stream word" to send predefined text
4. Use "Stream audio" to stream audio content (requires ElevenLabs key)
5. Click "Destroy" to close the connection

### Agents Demo

1. Click "Try Agents" from the home page
2. Click "Create new Agent with Knowledge" to set up an AI agent
3. Wait for the process to complete (monitor console for progress)
4. Click "Connect" to establish video connection
5. Type messages and click "Send" to interact with the agent
6. View responses in the message history panel

## API Configuration

The application requires a valid `api.json` configuration file in the `public` directory:

### Required Fields

- `key`: Your D-ID API key (Base64 encoded email:api_key)
- `url`: D-ID API endpoint (https://api.d-id.com)
- `websocketUrl`: D-ID WebSocket endpoint (wss://ws-api.d-id.com)
- `service`: Service type ("clips" or "talks")

### Optional Fields

- `elevenlabsKey`: ElevenLabs API key (required for audio streaming)

## File Structure

```
src/
├── app/
│   ├── agents/
│   │   └── page.js          # Agents demo page
│   ├── streaming/
│   │   └── page.js          # Streaming demo page
│   ├── utils/
│   │   ├── agents-client.js # Agents API client
│   │   └── streaming-client.js # Streaming API client
│   ├── globals.css          # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Home page
└── public/
    ├── api.json            # API configuration
    ├── emma_idle.mp4       # Idle video for Emma
    ├── cewe_idle.mp4    # Idle video for Alex
    └── bg.png              # Background image
```

## Key Components

### StreamingClient
Handles WebSocket-based video streaming:
- Connection management
- Text and audio streaming
- WebRTC peer connection handling
- Video element management

### AgentsClient
Manages AI agent interactions:
- Agent creation and setup
- Knowledge base integration
- Chat message handling
- Video response processing

## Environment Notes

- The application uses client-side rendering (`'use client'`)
- WebRTC requires HTTPS in production
- CORS is handled by D-ID's API endpoints
- Assets are served from the `public` directory

## Troubleshooting

### Common Issues

1. **"Please put your api key" alert**: Ensure `api.json` is properly configured
2. **WebRTC connection fails**: Check network connectivity and HTTPS usage
3. **Video not loading**: Verify video files are in the `public` directory
4. **Agent creation fails**: Check D-ID API key permissions and quotas

### Debug Tools

- Browser console for WebRTC and API logs
- Network tab for API request monitoring
- React DevTools for component state inspection

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Deployment considerations:**
   - Ensure HTTPS for WebRTC functionality
   - Configure proper CORS headers
   - Secure API key storage
   - Optimize video assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the D-ID Avatar Demo application. See the main project license for details.

## Support

For D-ID API issues, visit [D-ID Documentation](https://docs.d-id.com)
For ElevenLabs issues, visit [ElevenLabs Documentation](https://docs.elevenlabs.io)
