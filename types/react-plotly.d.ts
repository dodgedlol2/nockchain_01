declare module 'react-plotly.js' {
  import { Component } from 'react'
  
  interface PlotParams {
    data: any[]
    layout?: any
    config?: any
    style?: React.CSSProperties
    useResizeHandler?: boolean
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void
    onPurge?: (figure: any, graphDiv: HTMLElement) => void
    onError?: (err: any) => void
    onRelayout?: (eventData: any) => void
    onRestyle?: (eventData: any) => void
    onDoubleClick?: () => void
  }
  
  export default class Plot extends Component<PlotParams> {}
}
