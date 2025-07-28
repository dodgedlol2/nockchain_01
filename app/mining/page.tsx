'use client'
import { useState, useEffect } from 'react'
import AddressChart from '@/components/AddressChart'

interface AddressMetric {
  timestamp: number
  value: number
  blockHeight: number
  newAddresses: number
  activeAddresses: number
}

interface NockChainAddressData {
  addresses: AddressMetric[]
  tip: {
    height: number
    timestamp: number
    difficulty: number
    proofsPerSecond: number
  }
  metadata: {
    totalPoints: number
    dateRange: {
      start: number
      end: number
    }
    currentAddresses: number
    growthFactor: number
    latestWindow: AddressMetric
  }
}

export default function MiningPage() {
  const [data, setData] = useState<NockChainAddressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = async () => {
    try {
      setError(null)
      console.log('🔄 Fetching NockChain address data...')
      
      const response = await fetch('/api/nockblocks/addresses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      console.log('✅ Address data loaded successfully:', {
        points: result.data.addresses.length,
        cached: result.cached,
        currentAddresses: result.data.metadata.currentAddresses
      })

      setData(result.data)
      setLastUpdated(new Date())
      setLoading(false)

    } catch (err) {
      console.error('❌ Failed to load address data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load address data')
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading address growth data...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching wallet metrics from NockBlocks API</p>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Addresses</h3>
          <p className="text-xl font-bold text-white">
            {data.metadata.currentAddresses ? formatNumber(data.metadata.currentAddresses) : 'Loading...'}
          </p>
          <p className="text-xs text-green-400 mt-1">Current count</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Growth Factor</h3>
          <p className="text-xl font-bold text-white">
            {data.metadata.growthFactor ? `${data.metadata.growthFactor.toFixed(1)}x` : 'N/A'}
          </p>
          <p className="text-xs text-blue-400 mt-1">Since genesis</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">New Addresses</h3>
          <p className="text-xl font-bold text-white">
            {data.metadata.latestWindow && data.metadata.latestWindow.newAddresses 
              ? formatNumber(data.metadata.latestWindow.newAddresses)
              : 'N/A'
            }
          </p>
          <p className="text-xs text-purple-400 mt-1">Latest window</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Active Addresses</h3>
          <p className="text-xl font-bold text-white">
            {data.metadata.latestWindow && data.metadata.latestWindow.activeAddresses 
              ? formatNumber(data.metadata.latestWindow.activeAddresses)
              : 'N/A'
            }
          </p>
          <p className="text-xs text-orange-400 mt-1">Recent activity</p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Data Points</h3>
          <p className="text-xl font-bold text-white">
            {data.metadata.totalPoints ? data.metadata.totalPoints.toLocaleString() : '0'}
          </p>
          <p className="text-xs text-cyan-400 mt-1">Sample windows</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Address Growth Chart</h2>
          <button 
            onClick={loadData}
            className="px-3 py-1.5 bg-[#2A2A3E] text-white rounded-md text-sm hover:bg-[#3A3A4E] transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
        <AddressChart data={data.addresses} height={600} />
      </div>

      {/* Network Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Network Adoption</h2>
          <div className="space-y-3 text-gray-400">
            <div className="flex justify-between">
              <span>Block Height:</span>
              <span className="text-white font-mono">
                {data.tip && data.tip.height ? data.tip.height.toLocaleString() : 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Genesis Date:</span>
              <span className="text-white">May 21, 2025</span>
            </div>
            <div className="flex justify-between">
              <span>Analysis Window:</span>
              <span className="text-green-400">1,000 blocks</span>
            </div>
            <div className="flex justify-between">
              <span>Data Source:</span>
              <span className="text-green-400">NockBlocks API</span>
            </div>
            <div className="flex justify-between">
              <span>Update Frequency:</span>
              <span className="text-blue-400">5 minutes</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Chart Features</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>Total cumulative address count over time</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
              <span>Power law growth analysis with R² correlation</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Peak adoption period markers</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span>Linear and logarithmic scale options</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Real-time data from NockChain network</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Address Growth Insights</h2>
        <div className="grid md:grid-cols-3 gap-6 text-gray-400">
          <div>
            <h3 className="text-white font-semibold mb-2">Adoption Pattern</h3>
            <p className="text-sm">
              Address growth follows a power law distribution, indicating organic network 
              adoption with consistent user onboarding patterns typical of blockchain ecosystems.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Growth Analysis</h3>
            <p className="text-sm">
              The power law regression provides insights into the sustainability of network 
              growth and helps predict future adoption trends based on mathematical modeling.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Network Health</h3>
            <p className="text-sm">
              Steady address growth indicates healthy network expansion with new users 
              joining the ecosystem consistently since the May 21, 2025 genesis block.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Failed to Load Data</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-400">
          <p>No address data available</p>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num/1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num/1e3).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Address Growth Analytics</h1>
          <p className="text-gray-400">
            Analysis of NockChain address adoption with power law modeling
          </p>
        </div>
        
        {lastUpdated && (
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        )}export default function MiningPage() {
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
