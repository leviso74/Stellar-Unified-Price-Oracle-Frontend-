import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { usePriceHistory } from '../hooks/usePriceHistory'
import { useWebSocket } from '../hooks/useWebSocket'
import { usePrices } from '../hooks/usePrices'
import { usePriceAlerts } from '../hooks/usePriceAlerts'
import { PriceChart } from '../components/PriceChart'
import { SourceHealthBadge } from '../components/SourceHealthBadge'
import { ConnectionBadge } from '../components/ConnectionBadge'
import { formatPrice, formatTimestamp } from '../utils/format'

export function PriceDetail() {
  const { pair } = useParams<{ pair: string }>()
  const navigate = useNavigate()
  const decodedPair = pair ? decodeURIComponent(pair) : null
  const { history, loading: historyLoading } = usePriceHistory(decodedPair)
  const { prices } = usePrices(decodedPair ? [decodedPair] : undefined)
  const { livePrices, status, subscribe, unsubscribe } = useWebSocket()
  const { openAlertForm } = usePriceAlerts()

  useEffect(() => {
    if (decodedPair) subscribe([decodedPair])
    return () => {
      if (decodedPair) unsubscribe([decodedPair])
    }
  }, [decodedPair, subscribe, unsubscribe])

  const priceData = livePrices.get(decodedPair ?? '') ?? prices.find((p) => p.assetPair === decodedPair)

  if (!decodedPair) {
    navigate('/')
    return null
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {priceData && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{decodedPair}</h1>
                <button
                  onClick={() => decodedPair && openAlertForm(decodedPair)}
                  className="p-1 text-gray-500 hover:text-cyan-400 hover:bg-gray-800 rounded transition-colors"
                  title="Add Price Alert"
                  aria-label={`Add alert for ${decodedPair}`}
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {livePrices.has(decodedPair) && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Last updated: {formatTimestamp(priceData.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-cyan-400">
                {(priceData.confidence * 100).toFixed(1)}% confidence
              </span>
              <ConnectionBadge status={status} />
            </div>
          </div>

          <div className="text-5xl font-bold text-white mb-4 font-mono tracking-tight">
            ${formatPrice(priceData.price)}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Oracle Sources</p>
            <SourceHealthBadge sources={priceData.sources} />
          </div>
        </div>
      )}

      {!priceData && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 flex items-center justify-center text-gray-500">
          {historyLoading ? (
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" role="status" aria-label="Loading" />
          ) : (
            <p>No price data for {decodedPair}</p>
          )}
        </div>
      )}

      <PriceChart
        data={history}
        pair={decodedPair}
        loading={historyLoading}
      />
    </div>
  )
}
