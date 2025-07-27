export default function Header() {
  return (
    <header className="bg-[#0F0F1A] border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            NockChain Network Analytics
          </h2>
          <p className="text-sm text-gray-400">
            Real-time blockchain metrics and mining data
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Data</span>
          </div>
          
          <div className="bg-[#1A1A2E] px-3 py-1.5 rounded-lg">
            <span className="text-xs text-gray-400">Network Status:</span>
            <span className="text-xs text-green-400 ml-1 font-medium">Active</span>
          </div>
        </div>
      </div>
    </header>
  )
}
