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

// Genesis date for NockChain
const GENESIS_DATE = new Date('2021-11-07T00:00:00.000Z').getTime()

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

export default function
