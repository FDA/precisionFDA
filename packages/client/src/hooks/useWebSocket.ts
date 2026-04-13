import { useCallback, useEffect, useEffectEvent, useMemo, useSyncExternalStore } from 'react'
import {
  type WebSocketConnectionKey,
  type WebSocketConnectionSnapshot,
  websocketManager,
} from '../services/websocketManager'

/**
 * These hooks expose the React-specific layer around `websocketManager`. They
 * let components observe websocket state through `useSyncExternalStore` while
 * keeping socket ownership, reconnection policy, and message caching inside the
 * store implementation.
 *
 * `useWebSocketSelector` is the low-level hook. It accepts a websocket URL plus
 * connection options, subscribes to a selected slice of the store snapshot, and
 * returns that derived value together with a stable `sendMessage` helper.
 * Callers can provide a selector and equality function to avoid rerendering
 * when unrelated websocket fields change.
 *
 * Connection identity is controlled by `connectionKey` and `share`:
 * - When `connectionKey` is provided, that key defines the underlying store.
 * - When `share` is true, hooks using the same URL reuse one shared store.
 * - Otherwise, the hook creates an isolated store whose identity changes with
 *   the URL, so moving to a new endpoint creates a fresh connection.
 *
 * The hook only acquires a store when connection is enabled and a URL exists.
 * While mounted, it retains the store on mount and releases it on cleanup so
 * the manager keeps sockets alive only while something is actively using them.
 * `useWebSocket` is the convenience wrapper that returns the full snapshot
 * instead of a selected slice.
 */

type UseWebSocketOptions<Selection, T> = {
  connectionKey?: WebSocketConnectionKey
  isEqual?: (left: Selection, right: Selection) => boolean
  reconnectAttempts?: number
  reconnectInterval?: number
  selector?: (snapshot: WebSocketConnectionSnapshot<T>) => Selection
  share?: boolean
  shouldReconnect?: () => boolean
}

type UseWebSocketResult<T> = WebSocketConnectionSnapshot<T> & {
  sendMessage: (message: string) => void
}

const EMPTY_SNAPSHOT: WebSocketConnectionSnapshot = {
  lastJsonMessage: null,
  lastMessageEvent: null,
  reconnectAttempt: 0,
  status: 'idle',
}

export const useWebSocketSelector = <T, Selection>(
  url: string | null,
  {
    connectionKey,
    isEqual = Object.is,
    reconnectAttempts = 0,
    reconnectInterval = 0,
    selector,
    share = false,
    shouldReconnect = () => false,
  }: UseWebSocketOptions<Selection, T>,
  connect = true,
) => {
  const storeKey = useMemo<WebSocketConnectionKey | null>(() => {
    if (connectionKey !== undefined) {
      return connectionKey
    }

    if (share) {
      return url ?? 'shared-websocket'
    }

    // Isolated connections should get a fresh store when the URL changes.
    return url ? Symbol(url) : null
  }, [connectionKey, share, url])
  const selectionFn = selector ?? ((snapshot: WebSocketConnectionSnapshot<T>) => snapshot as Selection)
  const selectSnapshot = useEffectEvent((snapshot: WebSocketConnectionSnapshot<T>) => selectionFn(snapshot))
  const compareSelection = useEffectEvent((left: Selection, right: Selection) => isEqual(left, right))

  const store =
    connect && url && storeKey
      ? websocketManager.getStore(storeKey, {
          reconnectAttempts,
          reconnectInterval,
          shouldReconnect,
          url,
        })
      : null

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!store) {
        return () => {}
      }

      return store.subscribeWithSelector(
        snapshot => selectSnapshot(snapshot as WebSocketConnectionSnapshot<T>),
        listener,
        compareSelection,
      )
    },
    [store],
  )

  const getSnapshot = useCallback(
    () => selectionFn((store?.getSnapshot() ?? EMPTY_SNAPSHOT) as WebSocketConnectionSnapshot<T>),
    [selectionFn, store],
  )

  useEffect(() => {
    if (!store || !storeKey) {
      return
    }

    store.retain()
    return () => {
      websocketManager.releaseStore(storeKey)
    }
  }, [store, storeKey])

  const selected = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const sendMessage = useCallback(
    (message: string) => {
      if (!store) {
        return
      }

      store.send(message)
    },
    [store],
  )

  return {
    selected,
    sendMessage,
  }
}

export const useWebSocket = <T>(
  url: string | null,
  options: Omit<UseWebSocketOptions<WebSocketConnectionSnapshot<T>, T>, 'selector'> = {},
  connect = true,
): UseWebSocketResult<T> => {
  const { selected, sendMessage } = useWebSocketSelector<T, WebSocketConnectionSnapshot<T>>(
    url,
    {
      ...options,
      selector: snapshot => snapshot,
    },
    connect,
  )

  return {
    ...selected,
    sendMessage,
  }
}
