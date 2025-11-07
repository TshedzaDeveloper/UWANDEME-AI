import { format, parseISO } from 'date-fns'
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'

interface Signal {
  id: number
  pair: string
  side: 'BUY' | 'SELL'
  reason: string
  time_utc: string
  sl: number
  tp: number
  raw?: string
}

interface SignalsListProps {
  signals: Signal[]
  symbols: string[]
}

const SignalsList = ({ signals, symbols }: SignalsListProps) => {
  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), 'MMM dd, yyyy HH:mm:ss')
    } catch {
      return timeString
    }
  }

  const getSideColor = (side: string) => {
    return side === 'BUY' 
      ? 'signal-buy border-2' 
      : 'signal-sell border-2'
  }

  const getSideIcon = (side: string) => {
    return side === 'BUY' 
      ? <TrendingUp className="w-5 h-5" />
      : <TrendingDown className="w-5 h-5" />
  }

  // Group signals by pair
  const signalsByPair = signals.reduce((acc, signal) => {
    if (!acc[signal.pair]) {
      acc[signal.pair] = []
    }
    acc[signal.pair].push(signal)
    return acc
  }, {} as Record<string, Signal[]>)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Trading Signals History</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Updated every 30 seconds</span>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No signals generated yet</p>
          <p className="text-sm mt-2">Signals will appear here as they are generated</p>
        </div>
      ) : (
        <div className="space-y-6">
          {symbols.map((symbol) => {
            const pairSignals = signalsByPair[symbol] || []
            if (pairSignals.length === 0) return null

            return (
              <div key={symbol} className="glass rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span>{symbol}</span>
                  <span className="text-sm font-normal text-gray-400">
                    ({pairSignals.length} signal{pairSignals.length !== 1 ? 's' : ''})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pairSignals.slice(0, 6).map((signal) => (
                    <div
                      key={signal.id}
                      className={`p-4 rounded-lg ${getSideColor(signal.side)} transition-all hover:scale-105`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getSideIcon(signal.side)}
                          <span className="font-bold text-lg">{signal.side}</span>
                        </div>
                        <span className="text-xs opacity-75">{formatTime(signal.time_utc)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{signal.reason}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Stop Loss:</span>
                          <p className="text-red-400 font-semibold">
                            {signal.sl ? signal.sl.toFixed(5) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Take Profit:</span>
                          <p className="text-green-400 font-semibold">
                            {signal.tp ? signal.tp.toFixed(5) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {pairSignals.length > 6 && (
                  <p className="text-sm text-gray-400 mt-4 text-center">
                    + {pairSignals.length - 6} more signal{pairSignals.length - 6 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SignalsList

