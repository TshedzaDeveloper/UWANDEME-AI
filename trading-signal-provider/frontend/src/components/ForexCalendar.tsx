import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { Calendar, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CalendarEvent {
  time: string
  pair: string
  impact: 'low' | 'medium' | 'high'
  title: string
  forecast?: string | null
  previous?: string | null
}

interface ForexCalendarProps {
  events: CalendarEvent[]
}

const ForexCalendar = ({ events }: ForexCalendarProps) => {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />
      case 'medium':
        return <TrendingUp className="w-4 h-4" />
      case 'low':
        return <Minus className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const formatEventTime = (timeString: string) => {
    try {
      const date = parseISO(timeString)
      if (isToday(date)) {
        return `Today ${format(date, 'HH:mm')}`
      } else if (isTomorrow(date)) {
        return `Tomorrow ${format(date, 'HH:mm')}`
      } else {
        return format(date, 'MMM dd, HH:mm')
      }
    } catch {
      return timeString
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    try {
      return parseISO(a.time).getTime() - parseISO(b.time).getTime()
    } catch {
      return 0
    }
  })

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-6 h-6 text-primary-400" />
        <h2 className="text-2xl font-bold text-white">Forex Calendar</h2>
      </div>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          sortedEvents.map((event, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getImpactColor(event.impact)} transition-all hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getImpactIcon(event.impact)}
                  <span className="font-bold text-sm">{event.pair}</span>
                </div>
                <span className="text-xs opacity-75">{formatEventTime(event.time)}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{event.title}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${getImpactColor(event.impact)}`}>
                  {event.impact.toUpperCase()} Impact
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ForexCalendar

