import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'

interface StatsCardsProps {
  stats: any
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Total Signals',
      value: stats?.total_signals || 0,
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      title: 'Buy Signals',
      value: stats?.buy_signals || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    },
    {
      title: 'Sell Signals',
      value: stats?.sell_signals || 0,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20'
    },
    {
      title: 'Symbols Analyzed',
      value: stats?.symbols_analyzed || 0,
      icon: Activity,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`card ${card.bgColor} ${card.borderColor} border-2 hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards

