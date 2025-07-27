import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5B6CFF] to-[#7C3AED] bg-clip-text text-transparent">
          NockChain Analytics
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time mining metrics and network analytics for the NockChain blockchain
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Network Hashrate</h3>
          <p className="text-2xl font-bold text-white">Loading...</p>
          <p className="text-sm text-green-400 mt-1">Real-time data</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Block Height</h3>
          <p className="text-2xl font-bold text-white">Loading...</p>
          <p className="text-sm text-blue-400 mt-1">Current tip</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Mining Decentralization</h3>
          <p className="text-2xl font-bold text-white">Loading...</p>
          <p className="text-sm text-purple-400 mt-1">HHI Score</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/hashrate" className="group">
          <div className="bg-[#1A1A2E] p-8 rounded-lg border border-gray-700 hover:border-[#5B6CFF] transition-all duration-200 group-hover:bg-[#1E1E32]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B6CFF]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5B6CFF]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-[#5B6CFF] transition-colors">
                  Hashrate Analytics
                </h3>
                <p className="text-gray-400 mt-1">
                  Interactive hashrate charts with power law analysis
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/mining" className="group">
          <div className="bg-[#1A1A2E] p-8 rounded-lg border border-gray-700 hover:border-[#5B6CFF] transition-all duration-200 group-hover:bg-[#1E1E32]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B6CFF]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5B6CFF]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.27,4.73L19.27,9.73C19.65,10.11 19.65,10.74 19.27,11.12L14.27,16.12C13.89,16.5 13.26,16.5 12.88,16.12C12.5,15.74 12.5,15.11 12.88,14.73L16.16,11.45H8.91L12.19,14.73C12.57,15.11 12.57,15.74 12.19,16.12C11.81,16.5 11.18,16.5 10.8,16.12L5.8,11.12C5.42,10.74 5.42,10.11 5.8,9.73L10.8,4.73C11.18,4.35 11.81,4.35 12.19,4.73C12.57,5.11 12.57,5.74 12.19,6.12L8.91,9.4H16.16L12.88,6.12C12.5,5.74 12.5,5.11 12.88,4.73C13.26,4.35 13.89,4.35 14.27,4.73Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-[#5B6CFF] transition-colors">
                  Mining Metrics
                </h3>
                <p className="text-gray-400 mt-1">
                  Mining decentralization and network health data
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* About Section */}
      <div className="bg-[#1A1A2E] p-8 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">About NockChain</h2>
        <p className="text-gray-400 leading-relaxed">
          NockChain Analytics provides comprehensive real-time metrics for the NockChain blockchain network. 
          Track mining hashrate, network decentralization, and blockchain health with interactive charts and 
          detailed analytics powered by the NockBlocks API.
        </p>
      </div>
    </div>
  )
}
