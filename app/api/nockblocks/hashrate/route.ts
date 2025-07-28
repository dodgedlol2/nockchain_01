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
      console.log('📦 Returning cached data')
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      })
    }

    console.log('🚀 Fetching fresh NockChain data...')

    // Get current blockchain tip
    const tip = await makeNockRPCCall('getTip')
    console.log(`📊 Current height: ${tip.height}`)

    // Get proofrate history with high sample limit
    const proofRateData = await makeNockRPCCall('getProofRateHistory', [{
      startHeight: 0,
      endHeight: tip.height,
      maxSamples: 5000,
      smoothingType: 'smoothed_100'
    }])

    if (!proofRateData || !proofRateData.data) {
      throw new Error('No proofrate data received')
    }

    // Transform data to our format
    const hashrateData = proofRateData.data.map((point: any) => ({
      timestamp: (point.timestamp || 0) * 1000, // Convert to milliseconds
      value: point.adjusted_proofrate || point.proofrate || 0
    })).filter((point: any) => 
      point.value > 0 && 
      point.timestamp > 0 && 
      !isNaN(point.value) && 
      !isNaN(point.timestamp)
    ) // Remove invalid data points

    console.log(`✅ Processed ${hashrateData.length} hashrate data points`)

    // Ensure we have valid data
    if (hashrateData.length === 0) {
      throw new Error('No valid hashrate data points after filtering')
    }

    // Cache the result
    cachedData = {
      hashrate: hashrateData,
      tip: {
        height: tip.height || 0,
        timestamp: tip.timestamp || 0,
        difficulty: tip.difficulty || 0,
        proofsPerSecond: tip.proofsPerSecond || 0
      },
      metadata: {
        totalPoints: hashrateData.length,
        dateRange: {
          start: hashrateData[0]?.timestamp || 0,
          end: hashrateData[hashrateData.length - 1]?.timestamp || 0
        },
        currentHashrate: hashrateData[hashrateData.length - 1]?.value || 0
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
    console.error('💥 API Error:', error)
    
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
