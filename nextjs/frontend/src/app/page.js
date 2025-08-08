import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          D-ID Avatar Demo
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Experience AI-powered video streaming and intelligent agents
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Streaming Demo Card */}
          <Link href="/streaming" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-purple-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Streaming Demo</h2>
              <p className="text-gray-600 mb-6">
                Real-time video streaming with WebSocket connection. Stream text and audio to create dynamic AI presentations.
              </p>
              <div className="text-purple-600 font-medium group-hover:text-purple-700">
                Try Streaming →
              </div>
            </div>
          </Link>

          {/* Agents Demo Card */}
          <Link href="/agents" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-blue-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agents Demo</h2>
              <p className="text-gray-600 mb-6">
                Interactive AI agents with knowledge base integration. Create intelligent conversational experiences.
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">
                Try Agents →
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Streaming</h3>
            <p className="text-gray-600 text-sm">WebRTC-powered video streaming with low latency</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Conversations</h3>
            <p className="text-gray-600 text-sm">Intelligent chat with knowledge-based responses</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v12a2 2 0 002 2h6a2 2 0 002-2V8M7 8H5a2 2 0 00-2 2v10a2 2 0 002 2h2M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Modern UI</h3>
            <p className="text-gray-600 text-sm">Clean, responsive interface built with Next.js</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Powered by</p>
          <div className="flex justify-center space-x-8 text-gray-600">
            <span className="text-sm font-medium">Next.js</span>
            <span className="text-sm font-medium">React</span>
            <span className="text-sm font-medium">WebRTC</span>
            <span className="text-sm font-medium">D-ID API</span>
            <span className="text-sm font-medium">Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
