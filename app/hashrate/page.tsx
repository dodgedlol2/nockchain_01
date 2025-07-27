'use client'
import { useState, useEffect } from 'react'
import HashrateChart from '@/components/HashrateChart'

interface NockMetric {
  timestamp: number
  value: number
}

export default function HashratePage() {
  const [hashrateData, setHashrateData] = useState<NockMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate data loading - replace with actual API call
  useEffect(() => {
    const loadData = async () => {
      try {
        // For now, generate sample data
        // In production, this would be: const response = await fetch('/api/nockblocks/hashrate')
        const sampleData: NockMetric[] = generateSampleData()
        setHashrateData(sampleData)
        setLoading(false)
      } catch (err) {
        setError('Failed to load hashrate data')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Generate sample hashrate data for demonstration
  const generateSampleData = (): NockMetric[] => {
    const now = Date.now()
    const data: NockMetric[] = []
    const startDate = new Date('2021-11-07').getTime() // NockChain genesis
    
    for (let i = 0; i < 1000; i++) {
      const timestamp = startDate + (i * 24 * 60 * 60 * 1000) // Daily data points
      if (timestamp > now) break
      
      // Simulate growing hashrate with some volatility
      const daysSinceGenesis = i + 1
      const baseHashrate = Math.pow(daysSinceGenesis, 1.5) * 1e12 // Power law growth
      const volatility = 0.8 + Math.random() * 0.4 // ±20% volatility
      const value = baseHashrate * volatility
      
      data.push({ timestamp, value })
    }
    
    return data
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#5B6CFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading hashrate data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
              </svg>
            </div>
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#5B6CFF] text-white rounded-lg hover:bg-[#4C5DF0] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hashrate Analytics</h1>
        <p className="text-gray-400">
          Interactive analysis of NockChain network hashrate with power law modeling
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Current Hashrate</h3>
          <p className="text-xl font-bold text-white">
            {hashrateData.length > 0 
              ? `${(hashrateData[hashrateData.length - 1].value / 1e15).toFixed(2)} PH/s`
              : 'N/A'
            }
          </p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">All-Time High</h3>
          <p className="text-xl font-bold text-white">
            {hashrateData.length > 0 
              ? `${(Math.max(...hashrateData.map(d => d.value)) / 1e15).toFixed(2)} PH/s`
              : 'N/A'
            }
          </p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Data Points</h3>
          <p className="text-xl font-bold text-white">
            {hashrateData.length.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-[#1A1A2E] p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Growth Factor</h3>
          <p className="text-xl font-bold text-white">
            {hashrateData.length > 1 
              ? `${(hashrateData[hashrateData.length - 1].value / hashrateData[0].value).toFixed(1)}x`
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
        <HashrateChart data={hashrateData} height={600} />
      </div>

      {/* Info Section */}
      <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">About Hashrate Analysis</h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-400">
          <div>
            <h3 className="text-white font-semibold mb-2">Interactive Controls</h3>
            <ul className="space-y-1 text-sm">
              <li>• Switch between Linear and Logarithmic scales</li>
              <li>• Toggle power law regression analysis</li>
              <li>• Select different time periods</li>
              <li>• View All-Time High and Low markers</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Data Source</h3>
            <ul className="space-y-1 text-sm">
              <li>• Real-time data from NockBlocks API</li>
              <li>• Historical data from genesis block</li>
              <li>• Updates every block</li>
              <li>• Power law analysis included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
