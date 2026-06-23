import { useState, useEffect } from 'react'
import { usePriceAlerts } from '../hooks/usePriceAlerts'
import { usePrices } from '../hooks/usePrices'

export function AlertForm() {
  const { isFormOpen, closeAlertForm, addAlert, selectedAssetPair } = usePriceAlerts()
  const { prices } = usePrices()
  const [assetPair, setAssetPair] = useState('')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [targetPrice, setTargetPrice] = useState('')

  useEffect(() => {
    if (isFormOpen) {
      setAssetPair(selectedAssetPair || (prices[0]?.assetPair ?? ''))
      setCondition('above')
      setTargetPrice('')
    }
  }, [isFormOpen, selectedAssetPair, prices])

  if (!isFormOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetPair || !targetPrice || isNaN(Number(targetPrice))) return

    addAlert({
      assetPair,
      condition,
      targetPrice: Number(targetPrice)
    })
    closeAlertForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Price Alert</h2>
          <button onClick={closeAlertForm} className="text-gray-500 hover:text-gray-300" type="button" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Asset Pair</label>
            <select
              value={assetPair}
              onChange={(e) => setAssetPair(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="" disabled>Select a pair</option>
              {prices.map(p => (
                <option key={p.assetPair} value={p.assetPair}>{p.assetPair}</option>
              ))}
              {/* Fallback if user selects a pair not in current prices list */}
              {assetPair && !prices.find(p => p.assetPair === assetPair) && (
                <option value={assetPair}>{assetPair}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Condition</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  condition === 'above' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700'
                }`}
              >
                Goes Above
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  condition === 'below' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-400 border border-transparent hover:bg-gray-700'
                }`}
              >
                Goes Below
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Price (USD)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold rounded-lg px-4 py-3 mt-6 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Create Alert
          </button>
        </form>
      </div>
    </div>
  )
}
