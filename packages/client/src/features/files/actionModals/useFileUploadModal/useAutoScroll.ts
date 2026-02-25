import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { FileUploadStore } from './FileUploadStore'

interface UseAutoScrollOptions {
  store: FileUploadStore
  uploadInProgress: boolean
  minFilesForAutoScroll?: number
}

interface UseAutoScrollReturn {
  autoScroll: boolean
  setAutoScroll: (value: boolean) => void
  fileRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  showAutoScrollButton: boolean
}

const isTerminalStatus = (status: string): boolean =>
  status === 'completed' || status === 'failed' || status === 'cancelled'

const selectFilesCount = (store: FileUploadStore): number => store.getFileIds().length

const selectActiveOrNextFileId = (store: FileUploadStore): string | null => {
  const filesMeta = store.getFiles()
  // First, check for actively uploading/processing files
  const activeFile = filesMeta.find(
    file =>
      file.status === 'uploading' ||
      file.status === 'preparing' ||
      file.status === 'hashing' ||
      file.status === 'retrying' ||
      file.status === 'finalizing',
  )

  if (activeFile) return activeFile.id

  // If no active file, find the next queued file
  const queued = filesMeta.find(file => file.status === 'queued')
  return queued ? queued.id : null
}

const selectLastFileFinished = (store: FileUploadStore): boolean => {
  const filesMeta = store.getFiles()
  const lastFile = filesMeta.at(-1)
  return lastFile ? isTerminalStatus(lastFile.status) : false
}

/**
 * Custom hook to manage auto-scrolling behavior for file upload list
 */
export const useAutoScroll = ({
  store,
  uploadInProgress,
  minFilesForAutoScroll = 5,
}: UseAutoScrollOptions): UseAutoScrollReturn => {
  const [autoScroll, setAutoScroll] = useState(false)
  const fileRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const prevActiveFileIdRef = useRef<string | null>(null)
  const scrollableParentRef = useRef<HTMLElement | null>(null)
  const isAutoScrollingRef = useRef(false)
  const userScrollIntentRef = useRef(false)

  const filesCount = useSyncExternalStore(store.subscribe, () => selectFilesCount(store))

  const showAutoScrollButton = uploadInProgress && filesCount > minFilesForAutoScroll

  // Find the currently active or next queued file
  const activeOrNextFileId = useSyncExternalStore(store.subscribe, () => selectActiveOrNextFileId(store))
  const lastFileFinished = useSyncExternalStore(store.subscribe, () => selectLastFileFinished(store))

  // Find scrollable parent element
  // Use useEffectEvent since this accesses DOM and doesn't need to be reactive
  const findScrollableParent = useEffectEvent((element: HTMLElement): HTMLElement | null => {
    let parent = element.parentElement
    while (parent) {
      const style = window.getComputedStyle(parent)
      if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
        return parent
      }
      parent = parent.parentElement
    }
    return null
  })

  // Auto-enable when upload starts.
  // useLayoutEffect prevents one-frame inactive style flicker on the button.
  useLayoutEffect(() => {
    if (uploadInProgress && filesCount > minFilesForAutoScroll) {
      setAutoScroll(true)
    } else if (!uploadInProgress) {
      setAutoScroll(false)
    }
  }, [uploadInProgress, minFilesForAutoScroll, filesCount])

  useEffect(() => {
    userScrollIntentRef.current = false
  }, [autoScroll])

  // Detect manual scroll and disable auto-scroll
  // Use useEffectEvent to access the latest isAutoScrollingRef without re-creating the handler
  const handleUserScrollIntent = useEffectEvent((_event: Event) => {
    userScrollIntentRef.current = true
  })

  const handleScroll = useEffectEvent((_event: Event) => {
    // Only disable if this scroll wasn't triggered by our auto-scroll
    if (!isAutoScrollingRef.current && userScrollIntentRef.current) {
      userScrollIntentRef.current = false
      setAutoScroll(false)
    }
  })

  useEffect(() => {
    if (!autoScroll) return

    // Find and cache the scrollable parent
    const firstFileElement = fileRefs.current.values().next().value
    if (firstFileElement && !scrollableParentRef.current) {
      scrollableParentRef.current = findScrollableParent(firstFileElement)
    }

    const scrollableParent = scrollableParentRef.current
    if (scrollableParent) {
      scrollableParent.addEventListener('scroll', handleScroll, { passive: true })
      scrollableParent.addEventListener('wheel', handleUserScrollIntent, { passive: true })
      scrollableParent.addEventListener('pointerdown', handleUserScrollIntent, { passive: true })
      scrollableParent.addEventListener('keydown', handleUserScrollIntent)
      return () => {
        userScrollIntentRef.current = false
        scrollableParent.removeEventListener('scroll', handleScroll)
        scrollableParent.removeEventListener('wheel', handleUserScrollIntent)
        scrollableParent.removeEventListener('pointerdown', handleUserScrollIntent)
        scrollableParent.removeEventListener('keydown', handleUserScrollIntent)
      }
    }
  }, [autoScroll])

  // Perform auto-scroll to active file
  const performScroll = useEffectEvent((fileId: string) => {
    const fileElement = fileRefs.current.get(fileId)

    if (fileElement) {
      // Find the scrollable parent container
      let scrollableParent = scrollableParentRef.current
      if (!scrollableParent) {
        scrollableParent = findScrollableParent(fileElement)
        scrollableParentRef.current = scrollableParent
      }

      if (scrollableParent) {
        const containerRect = scrollableParent.getBoundingClientRect()
        const fileRect = fileElement.getBoundingClientRect()

        // Check if the file is not fully visible in the container
        const isAboveView = fileRect.top < containerRect.top
        const isBelowView = fileRect.bottom > containerRect.bottom

        if (isAboveView && !lastFileFinished) {
          return
        }

        if (isAboveView || isBelowView) {
          // Mark that we're auto-scrolling to prevent disabling on scroll event
          isAutoScrollingRef.current = true
          fileElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

          // Reset the flag after scroll animation completes
          setTimeout(() => {
            isAutoScrollingRef.current = false
          }, 1000)
        }
      }
    }
  })

  useEffect(() => {
    if (!autoScroll || !activeOrNextFileId || !uploadInProgress) return

    // Only scroll if the active file has changed
    if (prevActiveFileIdRef.current === activeOrNextFileId) return

    prevActiveFileIdRef.current = activeOrNextFileId
    performScroll(activeOrNextFileId)
  }, [autoScroll, activeOrNextFileId, uploadInProgress])

  // Reset refs when upload stops
  useEffect(() => {
    if (!uploadInProgress) {
      prevActiveFileIdRef.current = null
      scrollableParentRef.current = null
    }
  }, [uploadInProgress])

  return {
    autoScroll,
    setAutoScroll,
    fileRefs,
    showAutoScrollButton,
  }
}
