export interface PriceData {
  assetPair: string
  price: number
  timestamp: number
  confidence: number
  sources: string[]
}

export interface PriceHistoryEntry {
  price: number
  timestamp: number
  confidence: number
  sources: string[]
}

export interface PriceHistoryResponse {
  pair: string
  history: PriceHistoryEntry[]
}

export type SourceName = 'chainlink' | 'redstone' | 'band' | 'reflector'

export interface SourceHealth {
  source: SourceName
  status: 'healthy' | 'degraded' | 'down'
  lastUpdate: number | null
  latency: number | null
}

export interface WsSubscribeMessage {
  action: 'subscribe'
  assetPairs: string[]
}

export interface WsUnsubscribeMessage {
  action: 'unsubscribe'
  assetPairs: string[]
}

export interface WsPriceUpdate {
  type: 'price_update'
  assetPair: string
  price: number
  timestamp: number
  confidence: number
  sources: string[]
}

export type WsMessage = WsPriceUpdate

export interface PriceAlert {
  id: string
  assetPair: string
  condition: 'above' | 'below'
  targetPrice: number
  active: boolean
  triggeredAt?: number
}

export interface PriceAlertContextType {
  alerts: PriceAlert[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'active'>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void
  markAsRead: (id: string) => void
  openAlertForm: (assetPair?: string) => void
  isFormOpen: boolean
  closeAlertForm: () => void
  selectedAssetPair?: string
  isPanelOpen: boolean
  togglePanel: () => void
}
