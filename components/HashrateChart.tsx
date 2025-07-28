'use client'
import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

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
  const validData = data.filter(point => point.value > 0)
  
  if (validData.length < 2) {
    throw new Error("Not enough valid data points for power law fitting")
  }
  
  const logX = validData.map(point => {
    const daysFromGenesis = getDaysFromGenesis(point.timestamp)
    return Math.log(Math.max(1, daysFromGenesis))
  })
  const logY = validData.map(point => Math.log(point.value))
  
  // Linear regression on log-transformed data
  const n = logX.length
  const sumX = logX.reduce((a, b) => a + b, 0)
  const sumY = logY.reduce((a, b) => a + b, 0)
  const sumXY = logX.reduce((sum, x, i) => sum + x * logY[i], 0)
  const sumX2 = logX.reduce((sum, x) => sum + x * x, 0)
  const sumY2 = logY.reduce((sum, y) => sum + y * y, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
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
}

export default function HashrateChart({ data, height = 600 }: HashrateChartProps) {
  const [hashrateScale, setHashrateScale] = useState<'Linear' | 'Log'>('Log')
  const [timeScale, setTimeScale] = useState<'Linear' | 'Log'>('Linear')
  const [timePeriod, setTimePeriod] = useState<'1M' | '3M' | '6M' | '1Y' | 'All'>('All')
  const [showPowerLaw, setShowPowerLaw] = useState<'Hide' | 'Show'>('Show')

  // Filter data based on time period
  const filteredData = useMemo(() => {
    if (timePeriod === 'All' || data.length === 0) return data
    
    const now = Date.now()
    const days = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }
    const cutoffTime = now - days[timePeriod] * 24 * 60 * 60 * 1000
    
    return data.filter(point => point.timestamp >= cutoffTime)
  }, [data, timePeriod])

  // Calculate power law regression
  const powerLawData = useMemo(() => {
    if (showPowerLaw === 'Hide' || data.length < 10) return null
    
    try {
      const { a, b, r2 } = fitPowerLaw(data)
      return { a, b, r2 }
    } catch (error) {
      console.error('Power law calculation failed:', error)
      return null
    }
  }, [data, showPowerLaw])

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

    // Determine X values based on time scale
    let xValues: (number | Date)[]
    if (timeScale === 'Log') {
      xValues = filteredData.map(d => getDaysFromGenesis(d.timestamp))
    } else {
      xValues = filteredData.map(d => new Date(d.timestamp))
    }

    const yValues = filteredData.map(d => d.value)

    // Main hashrate trace
    traces.push({
      x: xValues,
      y: yValues,
      mode: 'lines',
      type: 'scatter',
      name: 'NockChain Hashrate',
      line: { color: '#5B6CFF', width: 2 },
      fill: hashrateScale === 'Log' ? 'tonexty' : 'tozeroy',
      fillgradient: {
        type: "vertical",
        colorscale: [
          [0, "rgba(13, 13, 26, 0.01)"],
          [1, "rgba(91, 108, 255, 0.6)"]
        ]
      },
      connectgaps: true,
      hovertemplate: timeScale === 'Linear' 
        ? '<b>%{fullData.name}</b><br>Hashrate: %{y}<extra></extra>'
        : '%{text}<br><b>%{fullData.name}</b><br>Hashrate: %{y}<extra></extra>',
      text: filteredData.map(d => new Date(d.timestamp).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })),
    })

    // Add power law if enabled
    if (powerLawData) {
      const allDaysFromGenesis = data.map(d => getDaysFromGenesis(d.timestamp))
      const yFit = allDaysFromGenesis.map(x => powerLawData.a * Math.pow(x, powerLawData.b))
      
      const filteredIndices = data.map((d, index) => ({...d, originalIndex: index}))
        .filter(d => filteredData.some(fd => fd.timestamp === d.timestamp))
        .map(d => d.originalIndex)
      
      const viewXFit = filteredIndices.map(i => allDaysFromGenesis[i])
      const viewYFit = filteredIndices.map(i => yFit[i])
      
      let fitX: (number | Date)[]
      if (timeScale === 'Log') {
        fitX = viewXFit
      } else {
        fitX = filteredIndices.map(i => new Date(data[i].timestamp))
      }

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

    // Add ATH marker
    if (athData) {
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
        name: 'High & Low',
        marker: {
          color: '#ffffff',
          size: 8,
          line: { color: '#5B6CFF', width: 2 }
        },
        text: [`High ${formatHashrate(athData.value)}`],
        textposition: 'top left',
        textfont: { color: '#ffffff', size: 11 },
        showlegend: true,
        hovertemplate: `<b>High</b><br>Hashrate: ${formatHashrate(athData.value)}<br>Date: ${new Date(athData.timestamp).toLocaleDateString()}<extra></extra>`,
      })
    }

    // Add ATL marker
    if (atlData) {
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
        text: [`Low ${formatHashrate(atlData.value)}`],
        textposition: 'bottom left',
        textfont: { color: '#ffffff', size: 11 },
        showlegend: false,
        hovertemplate: `<b>Low</b><br>Hashrate: ${formatHashrate(atlData.value)}<br>Date: ${new Date(atlData.timestamp).toLocaleDateString()}<extra></extra>`,
      })
    }

    return traces
  }, [filteredData, timeScale, hashrateScale, powerLawData, athData, atlData, data])

  // Plotly layout
  const plotlyLayout = useMemo(() => {
    if (filteredData.length === 0) return {}

    const yValues = filteredData.map(d => d.value)
    const yMinData = Math.min(...yValues)
    const yMaxData = Math.max(...yValues)
    
    let yMinChart: number, yMaxChart: number
    
    if (hashrateScale === 'Log') {
      yMinChart = yMinData * 0.8
      yMaxChart = yMaxData * 1.5
    } else {
      yMinChart = 0
      yMaxChart = yMaxData * 1.15
    }

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
      const daysFromGenesisValues = filteredData.map(d => getDaysFromGenesis(d.timestamp))
      const minDays = Math.min(...daysFromGenesisValues)
      const maxDays = Math.max(...daysFromGenesisValues)
      
      layout.xaxis = {
        title: { text: 'Days Since Genesis (Log Scale)' },
        type: 'log',
        showgrid: true,
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        color: '#9CA3AF',
        range: [Math.log10(minDays), Math.log10(maxDays)],
      }
    } else {
      const dates = filteredData.map(d => new Date(d.timestamp))
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
      
      layout.xaxis = {
        title: { text: 'Date' },
        type: 'date',
        showgrid: true,
        gridcolor: '#363650',
        color: '#9CA3AF',
        range: [minDate.toISOString(), maxDate.toISOString()],
      }
    }

    // Configure Y-axis
    layout.yaxis = {
      title: { text: 'Hashrate (H/s)' },
      type: hashrateScale === 'Log' ? 'log' : 'linear',
      gridcolor: '#363650',
      color: '#9CA3AF',
      range: hashrateScale === 'Log' 
        ? [Math.log10(yMinChart), Math.log10(yMaxChart)]
        : [yMinChart, yMaxChart],
    }

    return layout
  }, [filteredData, timeScale, hashrateScale, height])

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
    </div>
  )
}
