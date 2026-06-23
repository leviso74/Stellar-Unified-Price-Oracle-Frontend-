import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { PriceAlert, PriceAlertContextType } from '../types'
import { useWebSocket } from './useWebSocket'

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined)

export function PriceAlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('stellar_oracle_alerts')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAssetPair, setSelectedAssetPair] = useState<string | undefined>()
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (e) {
        console.error('Failed to request notification permission', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('stellar_oracle_alerts', JSON.stringify(alerts))
  }, [alerts])

  const activePairs = Array.from(new Set(alerts.filter(a => a.active).map(a => a.assetPair)))
  const { livePrices } = useWebSocket(activePairs.length > 0 ? activePairs : undefined)

  useEffect(() => {
    let changed = false
    const nextAlerts = alerts.map(alert => {
      if (!alert.active || alert.triggeredAt) return alert

      const live = livePrices.get(alert.assetPair)
      if (!live) return alert

      const triggered = 
        (alert.condition === 'above' && live.price >= alert.targetPrice) ||
        (alert.condition === 'below' && live.price <= alert.targetPrice)

      if (triggered) {
        changed = true
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Stellar Oracle Alert', {
            body: `${alert.assetPair} went ${alert.condition} $${alert.targetPrice} (Current: $${live.price})`,
          })
        }
        return { ...alert, triggeredAt: Date.now() }
      }
      return alert
    })

    if (changed) {
      setAlerts(nextAlerts)
    }
  }, [livePrices, alerts])

  const addAlert = useCallback(async (alert: Omit<PriceAlert, 'id' | 'active'>) => {
    await requestNotificationPermission()
    setAlerts(prev => [...prev, { ...alert, id: crypto.randomUUID(), active: true }])
  }, [requestNotificationPermission])

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active, triggeredAt: undefined } : a
    ))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, active: false } : a
    ))
  }, [])

  const openAlertForm = useCallback((assetPair?: string) => {
    setSelectedAssetPair(assetPair)
    setIsFormOpen(true)
  }, [])

  const closeAlertForm = useCallback(() => {
    setIsFormOpen(false)
    setSelectedAssetPair(undefined)
  }, [])

  const togglePanel = useCallback(() => setIsPanelOpen(p => !p), [])

  return (
    <PriceAlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        toggleAlert,
        markAsRead,
        openAlertForm,
        isFormOpen,
        closeAlertForm,
        selectedAssetPair,
        isPanelOpen,
        togglePanel
      }}
    >
      {children}
    </PriceAlertContext.Provider>
  )
}

export function usePriceAlerts() {
  const context = useContext(PriceAlertContext)
  if (context === undefined) {
    throw new Error('usePriceAlerts must be used within a PriceAlertProvider')
  }
  return context
}
