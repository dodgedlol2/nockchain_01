export default function MiningPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mining Analytics</h1>
        <p className="text-gray-400">
          Mining decentralization metrics and network health statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">HHI Score</h3>
          <p className="text-xl font-bold text-white">0.245</p>
          <p className="text-sm text-yellow-400 mt-1">Moderately Concentrated</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Active Miners</h3>
          <p className="text-xl font-bold text-white">156</p>
          <p className="text-sm text-green-400 mt-1">+12 this week</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Top Miner Share</h3>
          <p className="text-xl font-bold text-white">24.3%</p>
          <p className="text-sm text-blue-400 mt-1">Well below 51%</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Miners</h3>
          <p className="text-xl font-bold text-white">1,247</p>
          <p className="text-sm text-purple-400 mt-1">All-time total</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[#1A1A2E] p-12 rounded-lg border border-gray-700 text-center">
        <div className="w-16 h-16 bg-[#5B6CFF]/20 rounded-lg flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#5B6CFF]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Mining Charts Coming Soon</h2>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Interactive mining decentralization charts, pool distribution analysis, and network health 
          visualizations are currently in development. These features will provide deep insights into 
          the NockChain mining ecosystem.
        </p>
        <div className="mt-8 flex items-center justify-center space-x-4">
          <div className="w-2 h-2 bg-[#5B6CFF] rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Development in progress</span>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Planned Features</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#5B6CFF] rounded-full"></div>
              <span>Herfindahl-Hirschman Index (HHI) trending</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#5B6CFF] rounded-full"></div>
              <span>Mining pool distribution charts</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#5B6CFF] rounded-full"></div>
              <span>Miner participation rate analysis</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#5B6CFF] rounded-full"></div>
              <span>Network decentralization scoring</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Data Integration</h3>
          <div className="space-y-4 text-gray-400">
            <div>
              <h4 className="text-white font-semibold mb-2">NockBlocks API</h4>
              <p className="text-sm">
                Real-time mining decentralization metrics from the comprehensive NockBlocks API, 
                providing detailed insights into network health and miner distribution.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Historical Analysis</h4>
              <p className="text-sm">
                Complete historical data from genesis block to present, enabling trend analysis 
                and long-term decentralization pattern recognition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
