type WebSocketMessageEvent = MessageEvent<string>

export type WebSocketConnectionKey = string | symbol

export type WebSocketConnectionSnapshot<T = unknown> = {
  lastJsonMessage: T | null
  lastMessageEvent: WebSocketMessageEvent | null
  reconnectAttempt: number
  status: 'idle' | 'connecting' | 'open' | 'closed'
}

export type WebSocketConnectionConfig = {
  reconnectAttempts: number
  reconnectInterval: number
  shouldReconnect: () => boolean
  url: string | null
}

const INITIAL_SNAPSHOT: WebSocketConnectionSnapshot = {
  lastJsonMessage: null,
  lastMessageEvent: null,
  reconnectAttempt: 0,
  status: 'idle',
}

function parseJsonMessage(message: WebSocketMessageEvent): unknown {
  try {
    return JSON.parse(message.data)
  } catch {
    return null
  }
}

// This store is framework-agnostic on purpose: it owns the socket, reconnect
// policy, and cached snapshot so React can subscribe to it via
// `useSyncExternalStore` without mixing transport concerns into components.
class WebSocketConnectionStore {
  private config: WebSocketConnectionConfig
  private listeners = new Set<() => void>()
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null
  private retainCount = 0
  private snapshot: WebSocketConnectionSnapshot = INITIAL_SNAPSHOT
  private socket: WebSocket | null = null

  constructor(config: WebSocketConnectionConfig) {
    this.config = config
  }

  connect = () => {
    // A store represents exactly one logical connection. Repeated `connect()`
    // calls are ignored while the socket is already active or connecting.
    if (!this.config.url || this.socket || this.snapshot.status === 'connecting') {
      return
    }

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }

    this.updateSnapshot({ status: 'connecting' })

    let socket: WebSocket
    try {
      socket = new WebSocket(this.config.url)
    } catch {
      this.updateSnapshot({ status: 'closed' })
      return
    }

    this.socket = socket

    socket.onopen = () => {
      this.updateSnapshot({
        reconnectAttempt: 0,
        status: 'open',
      })
    }

    socket.onmessage = message => {
      this.updateSnapshot({
        lastJsonMessage: parseJsonMessage(message),
        lastMessageEvent: message,
      })
    }

    socket.onclose = () => {
      this.socket = null
      this.updateSnapshot({ status: 'closed' })

      // Reconnect only while something still retains this store. That lets the
      // manager keep shared connections efficient without background sockets
      // lingering after the last subscriber unmounts.
      if (
        this.retainCount === 0 ||
        !this.config.shouldReconnect() ||
        this.snapshot.reconnectAttempt >= this.config.reconnectAttempts
      ) {
        return
      }

      this.updateSnapshot({
        reconnectAttempt: this.snapshot.reconnectAttempt + 1,
      })

      this.reconnectTimeoutId = setTimeout(this.connect, this.config.reconnectInterval)
    }
  }

  disconnect = () => {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }

    this.socket?.close()
    this.socket = null
    this.updateSnapshot({
      reconnectAttempt: 0,
      status: 'idle',
    })
  }

  getSnapshot = () => this.snapshot

  release = () => {
    if (this.retainCount === 0) {
      return false
    }

    this.retainCount -= 1
    if (this.retainCount > 0) {
      return false
    }

    this.disconnect()
    return true
  }

  retain = () => {
    // `retain` / `release` act like reference counting for shared consumers.
    // The first retain opens the socket; the last release tears it down.
    this.retainCount += 1
    if (this.retainCount === 1) {
      this.connect()
    }
  }

  send = (message: string) => {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    }
  }

  setConfig = (config: WebSocketConnectionConfig) => {
    this.config = config
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  subscribeWithSelector = <Selection>(
    selector: (snapshot: WebSocketConnectionSnapshot) => Selection,
    onStoreChange: () => void,
    isEqual: (left: Selection, right: Selection) => boolean = Object.is,
  ) => {
    // Selector subscriptions let React observe only the slice it cares about,
    // which avoids unnecessary rerenders when unrelated socket state changes.
    let currentSelection = selector(this.snapshot)

    return this.subscribe(() => {
      const nextSelection = selector(this.snapshot)
      if (isEqual(currentSelection, nextSelection)) {
        return
      }

      currentSelection = nextSelection
      onStoreChange()
    })
  }

  private updateSnapshot = (patch: Partial<WebSocketConnectionSnapshot>) => {
    this.snapshot = {
      ...this.snapshot,
      ...patch,
    }

    this.listeners.forEach(listener => listener())
  }
}

// The manager is a keyed registry of stores. Callers can
// share a connection by reusing the same key, or create isolated connections
// by using distinct keys.
class WebSocketManager {
  private stores = new Map<WebSocketConnectionKey, WebSocketConnectionStore>()

  getStore = (key: WebSocketConnectionKey, config: WebSocketConnectionConfig) => {
    const existingStore = this.stores.get(key)
    if (existingStore) {
      existingStore.setConfig(config)
      return existingStore
    }

    const store = new WebSocketConnectionStore(config)
    this.stores.set(key, store)
    return store
  }

  releaseStore = (key: WebSocketConnectionKey) => {
    const store = this.stores.get(key)
    if (!store) {
      return
    }

    if (store.release()) {
      this.stores.delete(key)
    }
  }
}

export const websocketManager = new WebSocketManager()
