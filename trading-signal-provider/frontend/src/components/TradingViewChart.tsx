import { useEffect, useRef, useState } from 'react'

interface TradingViewChartProps {
  symbol: string
  symbols: string[]
  onSymbolChange: (symbol: string) => void
}

const TradingViewChart = ({ symbol, symbols, onSymbolChange }: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current || !symbol) return

    // Clean up previous widget
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = ''
    }

    // Create unique container ID
    const containerId = `tradingview_${symbol}_${Date.now()}`
    if (chartContainerRef.current) {
      chartContainerRef.current.id = containerId
    }

    // Wait for TradingView script to load
    const initWidget = () => {
      if (window.TradingView && chartContainerRef.current) {
        try {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: `FX:${symbol}`,
            interval: '1',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#1a1a1a',
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            container_id: containerId,
            height: 600,
            studies: [
              {
                id: 'MASimple@tv-basicstudies',
                inputs: { length: 8 }
              },
              {
                id: 'MASimple@tv-basicstudies',
                inputs: { length: 21 }
              },
              {
                id: 'RSI@tv-basicstudies',
                inputs: { length: 14 }
              }
            ]
          })
        } catch (error) {
          console.error('Error creating TradingView widget:', error)
        }
      }
    }

    // Check if TradingView is already loaded
    if (window.TradingView) {
      initWidget()
    } else {
      // Wait for script to load
      const checkTradingView = setInterval(() => {
        if (window.TradingView) {
          clearInterval(checkTradingView)
          initWidget()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkTradingView), 10000)
    }

    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = ''
      }
    }
  }, [symbol])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Trading View Chart</h2>
        <div className="flex space-x-2">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => onSymbolChange(sym)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                symbol === sym
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={chartContainerRef}
        className="w-full rounded-lg overflow-hidden bg-dark-800"
        style={{ height: '600px', minHeight: '600px' }}
      />
    </div>
  )
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: any
  }
}

export default TradingViewChart

