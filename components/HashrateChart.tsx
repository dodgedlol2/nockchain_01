'use client'
import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Plotly with better error handling
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#5B6CFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading chart...</p>
      </div>
    </div>
  )
})

interface NockMetric {
  timestamp: number
  value: number
}

interface HashrateChartProps {
  data: NockMetric[]
  height?: number
}

// Genesis date for NockChain - May 21, 2025
const GENESIS_DATE = new Date('2025-05-21T00:00:00.000Z').getTime()

function getDaysFromGenesis(timestamp: number): number {
  return Math.max(1, Math.floor((timestamp - GENESIS_DATE) / (24 * 60 * 60 * 1000)) + 1)
}

function formatHashrate(value: number): string {
  if (value >= 1e18) {
    return `${(value/1e18).toFixed(2)} EH/s`
  } else if (value >= 1e15) {
    return `${(value/1e15).toFixed(2)} PH/s`
  } else if (value >= 1e12) {
    return `${(value/1e12).toFixed(2)} TH/s`
  } else if (value >= 1e9) {
    return `${(value/1e9).toFixed(2)} GH/s`
  } else {
    return `${(value/1e6).toFixed(2)} MH/s`
  }
}

function fitPowerLaw(data: NockMetric[]) {
  try {
    const validData = data.filter(point => point.value > 0 && !isNaN(point.value) && !isNaN(point.timestamp))
    
    if (validData.length < 2) {
      throw new Error("Not enough valid data points for power law fitting")
    }
    
    const logX = validData.map(point => {
      const daysFromGenesis = getDaysFromGenesis(point.timestamp)
      return Math.log(Math.max(1, daysFromGenesis))
    })
    const logY = validData.map(point => Math.log(point.value))
    
    // Check for invalid log values
    if (logX.some(x => !isFinite(x)) || logY.some(y => !isFinite(y))) {
      throw new Error("Invalid data for logarithmic transformation")
    }
    
    // Linear regression on log-transformed data
    const n = logX.length
    const sumX = logX.reduce((a, b) => a + b, 0)
    const sumY = logY.reduce((a, b) => a + b, 0)
    const sumXY = logX.reduce((sum, x, i) => sum + x * logY[i], 0)
    const sumX2 = logX.reduce((sum, x) => sum + x * x, 0)
    const sumY2 = logY.reduce((sum, y) => sum + y * y, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Check for invalid results
    if (!isFinite(slope) || !isFinite(intercept)) {
      throw new Error("Invalid regression results")
    }
    
    const meanX = sumX / n
    const meanY = sumY / n
    const ssXY = sumXY - n * meanX * meanY
    const ssXX = sumX2 - n * meanX * meanX
    const ssYY = sumY2 - n * meanY * meanY
    const rValue = ssXY / Math.sqrt(ssXX * ssYY)
    const r2 = rValue * rValue
    
    const a = Math.exp(intercept)
    const b = slope
    
    return { a, b, r2 }
  } catch (error) {
    console.error('Power law fitting error:', error)
    return null
  }
}

export default function HashrateChart({ data, height = 600 }: HashrateChartProps) {
  const [hashrateScale, setHashrateScale] = useState<'Linear' | 'Log'>('Log')
  const [timeScale, setTimeScale] = useState<'Linear' | 'Log'>('Linear')
  const [timePeriod, setTimePeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'All'>('All')
  const [showPowerLaw, setShowPowerLaw] = useState<'Hide' | 'Show'>('Show')
  const [showProjection, setShowProjection] = useState<'Hide' | 'Show'>('Show')

  // Validate and filter data
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return []
    
    return data.filter(point => 
      point && 
      typeof point.timestamp === 'number' && 
      typeof point.value === 'number' &&
      !isNaN(point.timestamp) && 
      !isNaN(point.value) &&
      point.value > 0 &&
      point.timestamp > 0
    ).sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
  }, [data])

  // Filter data based on time period
  const filteredData = useMemo(() => {
    if (timePeriod === 'All' || validData.length === 0) return validData
    
    const now = Date.now()
    const days = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
    const cutoffTime = now - days[timePeriod] * 24 * 60 * 60 * 1000
    
    return validData.filter(point => point.timestamp >= cutoffTime)
  }, [validData, timePeriod])

  // Calculate power law regression
  const powerLawData = useMemo(() => {
    if (showPowerLaw === 'Hide' || validData.length < 10) return null
    
    return fitPowerLaw(validData)
  }, [validData, showPowerLaw])

  // Generate hashrate projection
  const hashrateProjection = useMemo(() => {
    if (showProjection === 'Hide' || !powerLawData || validData.length < 10) return null
    
    try {
      const lastPoint = validData[validData.length - 1]
      const lastDays = getDaysFromGenesis(lastPoint.timestamp)
      const projectionDays = 1000 // Project 1000 days into the future
      
      const projectionPoints: Array<{timestamp: number, hashrate: number}> = []
      
      for (let i = 1; i <= projectionDays; i += 10) { // Every 10 days
        const futureDays = lastDays + i
        const futureTimestamp = lastPoint.timestamp + (i * 24 * 60 * 60 * 1000)
        
        // Hashrate projection using power law
        const projectedHashrate = powerLawData.a * Math.pow(futureDays, powerLawData.b)
        
        projectionPoints.push({
          timestamp: futureTimestamp,
          hashrate: projectedHashrate
        })
      }
      
      return projectionPoints
    } catch (error) {
      console.error('Hashrate projection calculation failed:', error)
      return null
    }
  }, [validData, powerLawData, showProjection])

  // Calculate ATH and ATL
  const athData = useMemo(() => {
    if (filteredData.length === 0) return null
    return filteredData.reduce((max, point) => 
      point.value > max.value ? point : max
    )
  }, [filteredData])

  const atlData = useMemo(() => {
    if (filteredData.length === 0) return null
    return filteredData.reduce((min, point) => 
      point.value < min.value ? point : min
    )
  }, [filteredData])

  // Prepare Plotly data
  const plotlyData = useMemo(() => {
    if (filteredData.length === 0) return []

    const traces: any[] = []

    try {
      // Determine X values based on time scale
      let xValues: (number | Date)[]
      if (timeScale === 'Log') {
        xValues = filteredData.map(d => getDaysFromGenesis(d.timestamp))
      } else {
        xValues = filteredData.map(d => new Date(d.timestamp))
      }

      const yValues = filteredData.map(d => d.value)

      // Validate arrays
      if (xValues.length !== yValues.length || xValues.length === 0) {
        console.error('Invalid data arrays for plotting')
        return []
      }

      // Main hashrate trace
      traces.push({
        x: xValues,
        y: yValues,
        mode: 'lines',
        type: 'scatter',
        name: 'NockChain Hashrate',
        line: { color: '#5B6CFF', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(91, 108, 255, 0.2)',
        connectgaps: true,
        hovertemplate: '<b>%{fullData.name}</b><br>Hashrate: %{y}<br>Date: %{x}<extra></extra>',
      })

      // Add power law if enabled and available
      if (powerLawData && powerLawData.a && powerLawData.b && isFinite(powerLawData.r2)) {
        try {
          const allDaysFromGenesis = validData.map(d => getDaysFromGenesis(d.timestamp))
          const yFit = allDaysFromGenesis.map(x => powerLawData.a * Math.pow(x, powerLawData.b))
          
          // Filter to match current view
          const filteredIndices = validData.map((d, index) => ({...d, originalIndex: index}))
            .filter(d => filteredData.some(fd => fd.timestamp === d.timestamp))
            .map(d => d.originalIndex)
          
          if (filteredIndices.length > 0) {
            const viewXFit = filteredIndices.map(i => allDaysFromGenesis[i])
            const viewYFit = filteredIndices.map(i => yFit[i])
            
            let fitX: (number | Date)[]
            if (timeScale === 'Log') {
              fitX = viewXFit
            } else {
              fitX = filteredIndices.map(i => new Date(validData[i].timestamp))
            }

            // Validate fit data
            if (fitX.length === viewYFit.length && viewYFit.every(y => isFinite(y))) {
              traces.push({
                x: fitX,
                y: viewYFit,
                mode: 'lines',
                type: 'scatter',
                name: `Power Law (R² ${powerLawData.r2.toFixed(2)})`,
                line: { color: '#ff8c00', width: 2, dash: 'solid' },
                connectgaps: true,
                showlegend: true,
                hovertemplate: '<b>%{fullData.name}</b><br>Fit: %{y}<extra></extra>',
              })
            }
          }
        } catch (error) {
          console.error('Error creating power law trace:', error)
        }
      }

      // Add hashrate projections
      if (hashrateProjection) {
        try {
          let projectionX: (number | Date)[]
          if (timeScale === 'Log') {
            projectionX = hashrateProjection.map(p => getDaysFromGenesis(p.timestamp))
          } else {
            projectionX = hashrateProjection.map(p => new Date(p.timestamp))
          }
          
          const projectionY = hashrateProjection.map(p => p.hashrate)
          
          traces.push({
            x: projectionX,
            y: projectionY,
            mode: 'lines',
            type: 'scatter',
            name: 'Hashrate Projection (1000 days)',
            line: { color: '#5B6CFF', width: 2, dash: 'dot' },
            connectgaps: true,
            showlegend: true,
            hovertemplate: '<b>Projected Hashrate</b><br>Rate: %{y}<br>Date: %{x}<extra></extra>',
          })
        } catch (error) {
          console.error('Error creating hashrate projection trace:', error)
        }
      }

      // Add ATH marker
      if (athData) {
        try {
          let athX: number | Date
          if (timeScale === 'Log') {
            athX = getDaysFromGenesis(athData.timestamp)
          } else {
            athX = new Date(athData.timestamp)
          }
          
          traces.push({
            x: [athX],
            y: [athData.value],
            mode: 'markers+text',
            type: 'scatter',
            name: 'High',
            marker: {
              color: '#ffffff',
              size: 8,
              line: { color: '#5B6CFF', width: 2 }
            },
            text: [`High`],
            textposition: 'top center',
            textfont: { color: '#ffffff', size: 11 },
            showlegend: true,
            hovertemplate: `<b>All-Time High</b><br>Hashrate: ${formatHashrate(athData.value)}<br>Date: ${new Date(athData.timestamp).toLocaleDateString()}<extra></extra>`,
          })
        } catch (error) {
          console.error('Error creating ATH marker:', error)
        }
      }

      // Add ATL marker
      if (atlData && atlData !== athData) {
        try {
          let atlX: number | Date
          if (timeScale === 'Log') {
            atlX = getDaysFromGenesis(atlData.timestamp)
          } else {
            atlX = new Date(atlData.timestamp)
          }
          
          traces.push({
            x: [atlX],
            y: [atlData.value],
            mode: 'markers+text',
            type: 'scatter',
            name: 'Low',
            marker: {
              color: '#ffffff',
              size: 8,
              line: { color: '#5B6CFF', width: 2 }
            },
            text: [`Low`],
            textposition: 'bottom center',
            textfont: { color: '#ffffff', size: 11 },
            showlegend: false,
            hovertemplate: `<b>Low</b><br>Hashrate: ${formatHashrate(atlData.value)}<br>Date: ${new Date(atlData.timestamp).toLocaleDateString()}<extra></extra>`,
          })
        } catch (error) {
          console.error('Error creating ATL marker:', error)
        }
      }

    } catch (error) {
      console.error('Error preparing plot data:', error)
      return []
    }

    return traces
  }, [filteredData, timeScale, hashrateScale, powerLawData, hashrateProjection, athData, atlData, validData])

  // Plotly layout
  const plotlyLayout = useMemo(() => {
    if (filteredData.length === 0) return {}

    try {
      const layout: any = {
        height: height,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#9CA3AF', family: 'Inter, ui-sans-serif, system-ui, sans-serif' },
        hovermode: 'x unified',
        showlegend: true,
        margin: { l: 80, r: 20, t: 20, b: 50 },
        hoverlabel: {
          bgcolor: 'rgba(15, 20, 25, 0.95)',
          bordercolor: 'rgba(91, 108, 255, 0.5)',
          font: { color: '#e2e8f0', size: 11 },
        },
        legend: {
          orientation: "h",
          yanchor: "bottom",
          y: 1.02,
          xanchor: "left",
          x: 0,
          bgcolor: 'rgba(0,0,0,0)',
          font: { size: 11 }
        }
      }

      // Configure X-axis
      if (timeScale === 'Log') {
        layout.xaxis = {
          title: { text: 'Days Since Genesis (Log Scale)' },
          type: 'log',
          showgrid: true,
          gridcolor: 'rgba(255, 255, 255, 0.1)',
          color: '#9CA3AF',
        }
      } else {
        layout.xaxis = {
          title: { text: 'Date' },
          type: 'date',
          showgrid: true,
          gridcolor: '#363650',
          color: '#9CA3AF',
        }
      }

      // Configure Y-axis
      layout.yaxis = {
        title: { text: 'Hashrate (H/s)' },
        type: hashrateScale === 'Log' ? 'log' : 'linear',
        gridcolor: '#363650',
        color: '#9CA3AF',
      }

      return layout
    } catch (error) {
      console.error('Error creating layout:', error)
      return {}
    }
  }, [filteredData, timeScale, hashrateScale, height])

  // Show error state if no valid data
  if (validData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96 bg-[#0F0F1A] rounded-lg border border-gray-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
              </svg>
            </div>
            <p className="text-yellow-400 font-semibold">No Valid Data</p>
            <p className="text-gray-400 text-sm mt-2">No valid hashrate data points found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Hashrate Scale */}
          <select 
            value={hashrateScale} 
            onChange={(e) => setHashrateScale(e.target.value as 'Linear' | 'Log')}
            className="bg-[#1A1A2E] text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 focus:border-[#5B6CFF] outline-none"
          >
            <option value="Linear">Linear Scale</option>
            <option value="Log">Log Scale</option>
          </select>

          {/* Time Scale */}
          <select 
            value={timeScale} 
            onChange={(e) => setTimeScale(e.target.value as 'Linear' | 'Log')}
            className="bg-[#1A1A2E] text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 focus:border-[#5B6CFF] outline-none"
          >
            <option value="Linear">Linear Time</option>
            <option value="Log">Log Time</option>
          </select>

          {/* Power Law */}
          <select 
            value={showPowerLaw} 
            onChange={(e) => setShowPowerLaw(e.target.value as 'Hide' | 'Show')}
            className="bg-[#1A1A2E] text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 focus:border-[#5B6CFF] outline-none"
          >
            <option value="Hide">Hide Power Law</option>
            <option value="Show">Show Power Law</option>
          </select>

          {/* Projections */}
          <select 
            value={showProjection} 
            onChange={(e) => setShowProjection(e.target.value as 'Hide' | 'Show')}
            className="bg-[#1A1A2E] text-white px-3 py-1.5 rounded-md text-sm border border-gray-600 focus:border-[#5B6CFF] outline-none"
          >
            <option value="Hide">Hide Projections</option>
            <option value="Show">Show 1000-day Projection</option>
          </select>
        </div>

        {/* Time Period Buttons */}
        <div className="flex gap-2">
          {(['1M', '3M', '6M', '1Y', 'All'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                timePeriod === period
                  ? 'bg-[#5B6CFF] text-white'
                  : 'bg-[#1A1A2E] text-gray-400 hover:bg-[#2A2A3E] hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }} className="w-full">
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          style={{ width: '100%', height: '100%' }}
          config={{
            displayModeBar: false,
            responsive: true,
            scrollZoom: true,
          }}
          useResizeHandler={true}
        />
      </div>

      {/* Data info */}
      <div className="text-sm text-gray-400 text-center">
        <p>
          Showing {filteredData.length.toLocaleString()} of {validData.length.toLocaleString()} data points
          {powerLawData && ` | Power Law R² = ${powerLawData.r2.toFixed(3)}`}
          {hashrateProjection && showProjection === 'Show' && ` | 1000-day projection enabled`}
        </p>
      </div>
    </div>
  )
}
