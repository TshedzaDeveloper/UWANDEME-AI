import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import SignalsList from './components/SignalsList'
import TradingViewChart from './components/TradingViewChart'
import ForexCalendar from './components/ForexCalendar'
import { getSignals, getStats, getSymbols, getCalendar } from './services/api'

function App() {
  const [signals, setSignals] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [symbols, setSymbols] = useState<string[]>([])
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('EURUSD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (symbols.length > 0 && !selectedSymbol) {
      setSelectedSymbol(symbols[0])
    }
  }, [symbols, selectedSymbol])

  const loadData = async () => {
    try {
      const [signalsData, statsData, symbolsData, calendarData] = await Promise.all([
        getSignals(100),
        getStats(),
        getSymbols(),
        getCalendar()
      ])
      setSignals(signalsData)
      setStats(statsData)
      setSymbols(symbolsData.symbols || [])
      setCalendarEvents(calendarData.events || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Uwandeme AI Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
            Uwandeme AI Trading Dashboard
          </h1>
          <p className="text-gray-400">Real-time forex signals powered by AI</p>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* TradingView Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TradingViewChart 
              symbol={selectedSymbol} 
              symbols={symbols}
              onSymbolChange={setSelectedSymbol}
            />
          </div>

          {/* Forex Calendar - Takes 1 column */}
          <div className="lg:col-span-1">
            <ForexCalendar events={calendarEvents} />
          </div>
        </div>

        {/* Signals List */}
        <div className="mt-6">
          <SignalsList signals={signals} symbols={symbols} />
        </div>
      </main>
    </div>
  )
}

export default App

