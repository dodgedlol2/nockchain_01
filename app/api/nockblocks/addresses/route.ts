import { NextResponse } from 'next/server'

interface NockRPCRequest {
  jsonrpc: string
  method: string
  params: any[]
  id: string
}

interface NockRPCResponse {
  jsonrpc: string
  result?: any
  error?: {
    code: number
    message: string
  }
  id: string
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000
let cachedData: any = null
let cacheTimestamp = 0

async function makeNockRPCCall(method: string, params: any[] = []): Promise<any> {
  const payload: NockRPCRequest = {
    jsonrpc: "2.0",
    method,
    params,
    id: `api_${Date.now()}`
  }

  try {
    console.log(`🔄 Calling NockBlocks API: ${method}`)
    
    const response = await fetch('https://nockblocks.com/rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NockChain-Analytics/1.0'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: NockRPCResponse = await response.json()
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`)
    }

    console.log(`✅ ${method} successful`)
    return data.result

  } catch (error) {
    console.error(`❌ Error calling ${method}:`, error)
    throw error
  }
}

export async function GET() {
  try {
    // Check cache first
    const now = Date.now()
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Returning cached wallet data')
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      })
    }

    console.log('🚀 Fetching fresh NockChain wallet data...')

    // Get current blockchain tip
    const tip = await makeNockRPCCall('getTip')
    console.log(`📊 Current height: ${tip.height}`)

    // Get wallet growth metrics with higher data points
    const walletGrowthData = await makeNockRPCCall('getWalletGrowthMetrics', [{
      windowSize: 1000,    // Analyze every 1000 blocks
      dataPoints: 100      // Get up to 100 data points
    }])

    if (!walletGrowthData || !walletGrowthData.windows) {
      throw new Error('No wallet growth data received')
    }

    // Transform data to our format
    const addressData = walletGrowthData.windows.map((window: any) => ({
      timestamp: (window.timestamp || 0) * 1000, // Convert to milliseconds
      value: window.totalUniqueAddresses || window.cumulativeAddresses || 0,
      blockHeight: window.endHeight || 0,
      newAddresses: window.newAddresses || 0,
      activeAddresses: window.activeAddresses || 0
    })).filter((point: any) => 
      point.value > 0 && 
      point.timestamp > 0 && 
      !isNaN(point.value) && 
      !isNaN(point.timestamp)
    ) // Remove invalid data points

    console.log(`✅ Processed ${addressData.length} address data points`)

    // Ensure we have valid data
    if (addressData.length === 0) {
      throw new Error('No valid address data points after filtering')
    }

    // Calculate growth metrics
    const currentAddresses = addressData[addressData.length - 1]?.value || 0
    const startAddresses = addressData[0]?.value || 1
    const growthFactor = currentAddresses / startAddresses

    // Cache the result
    cachedData = {
      addresses: addressData,
      tip: {
        height: tip.height || 0,
        timestamp: tip.timestamp || 0,
        difficulty: tip.difficulty || 0,
        proofsPerSecond: tip.proofsPerSecond || 0
      },
      metadata: {
        totalPoints: addressData.length,
        dateRange: {
          start: addressData[0]?.timestamp || 0,
          end: addressData[addressData.length - 1]?.timestamp || 0
        },
        currentAddresses: currentAddresses,
        growthFactor: growthFactor,
        latestWindow: addressData[addressData.length - 1] || {}
      }
    }
    cacheTimestamp = now

    return NextResponse.json({
      success: true,
      data: cachedData,
      cached: false,
      fetchTime: Date.now() - now
    })

  } catch (error) {
    console.error('💥 Wallet API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 })
  }
}

// Also export POST for flexibility
export async function POST() {
  return GET()
}
