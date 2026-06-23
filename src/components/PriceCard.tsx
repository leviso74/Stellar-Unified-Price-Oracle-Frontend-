import { memo } from 'react'
import type { PriceData } from '../types'
import { formatPrice, timeAgo } from '../utils/format'
import { usePriceAlerts } from '../hooks/usePriceAlerts'

const SOURCE_COLORS: Record<string, string> = {
  chainlink: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  redstone: 'bg-red-500/20 text-red-400 border-red-500/30',
  band: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  reflector: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

interface PriceCardProps {
  price: PriceData
  onClick?: () => void
  isLive?: boolean
}

export const PriceCard = memo(function PriceCard({ price, onClick, isLive }: PriceCardProps) {
  const confidencePct = (price.confidence * 100).toFixed(1)
  const { openAlertForm } = usePriceAlerts()

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openAlertForm(price.assetPair)
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all shadow-lg shadow-black/20 group relative"
      aria-label={`View details for ${price.assetPair}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-100">{price.assetPair}</h3>
          <div
            onClick={handleAlertClick}
            role="button"
            className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-gray-800 rounded transition-colors opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            title="Add Price Alert"
            aria-label={`Add alert for ${price.assetPair}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
        {isLive && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" role="status" aria-label="Live data" />}
      </div>

      <div className="text-3xl font-bold text-white mb-3 font-mono tracking-tight">
        ${formatPrice(price.price)}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Updated {timeAgo(price.timestamp)}</span>
        <span className="text-cyan-400">{confidencePct}% confidence</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {price.sources.map((src) => (
          <span
            key={src}
            className={`px-2 py-0.5 rounded text-xs font-medium border ${SOURCE_COLORS[src] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}
          >
            {src}
          </span>
        ))}
      </div>
    </button>
  )
})
