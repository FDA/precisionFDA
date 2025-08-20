import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../utils/config'
import { JobLogItem, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../home/types'
import { JobState } from './executions.types'
import { useAuthUser } from '../auth/useAuthUser'

const StyledLogsContainer = styled.div`
  padding: 4px 0 4px 12px;
  margin: 10px;
  border: 1px solid var(--c-layout-border);
  border-radius: 3px;
  position: relative;
`

const StyledDownloadButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 14px;
  z-index: 2;
`

const StyledLogs = styled.div`
  font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  height: 400px;
  overflow-y: auto;
  padding: 8px;
  position: relative;
  scroll-snap-type: y proximity;
`

const StyledLogLine = styled.div`
  line-height: 1.5;
  margin: 0;
  scroll-snap-align: start;
`

const VRow = styled.div`
  width: 100%;
  position: relative;
`
const VItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`

type ShowingLogItem = Pick<JobLogItem, 'source' | 'line' | 'level' | 'msg'>

const isStopSignal = (log: ShowingLogItem) => log.source === 'SYSTEM' && log.msg === 'END_LOG'

export const Logs = ({ jobUid, jobState }: { jobUid: string; jobState: JobState }) => {
  const user = useAuthUser()
  const [logs, setLogs] = useState<ShowingLogItem[]>([])
  const [isStreamingDone, setIsStreamingDone] = useState(false)
  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 10,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  const { sendMessage } = useWebSocket<WebSocketMessage>(
    getNodeWsUrl(),
    {
      share: false,
      reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
      reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
      shouldReconnect: () => SHOULD_RECONNECT,
      filter: message => {
        try {
          const data = JSON.parse(message.data)
          return data.type === WEBSOCKET_MESSAGE_TYPE.JOB_LOG
        } catch {
          return false
        }
      },
      onOpen: () => {
        if (!isStreamingDone && jobUid) {
          sendMessage(JSON.stringify({ event: WEBSOCKET_MESSAGE_TYPE.JOB_LOG, data: { jobUid } }))
        }
      },
      onMessage: message => {
        try {
          const messageData = JSON.parse(message.data)
          if (messageData.type === WEBSOCKET_MESSAGE_TYPE.JOB_LOG) {
            const newLog = messageData.data as JobLogItem
            if (isStopSignal(newLog)) {
              setIsStreamingDone(true)
              if (logs.length === 0) {
                setLogs([{ level: 'INFO', msg: 'No logs found', line: 0, source: 'client' }])
              }
              return
            }
            setLogs(prevLogs => [
              ...prevLogs,
              {
                level: newLog.level,
                msg: newLog.msg,
                line: newLog.line,
                source: newLog.source,
              },
            ])
          }
        } catch {
          // Ignore invalid messages
        }
      },
      onClose: () => {
        if (!isStreamingDone) {
          setLogs([])
        }
      },
    },
    !!user,
  )

  useEffect(() => {
    if (jobState === 'running') {
      // Auto scroll only if scrolled near to the bottom
      const isAtBottom =
        parentRef.current && parentRef.current.scrollHeight - parentRef.current.scrollTop - parentRef.current.clientHeight < 50

      if (isAtBottom) {
        rowVirtualizer.scrollToIndex(logs.length - 1)
      }
    }
  }, [logs, jobState])

  const downloadLogs = () => {
    const logText = logs.map(log => `${log.level}: ${log.msg}`).join('\n')
    const blob = new Blob([logText], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${jobUid}_logs.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <StyledLogsContainer>
      <StyledDownloadButton onClick={downloadLogs} disabled={logs.length === 0 || !isStreamingDone}>
        Download Log File
      </StyledDownloadButton>

      <StyledLogs ref={parentRef}>
        {logs.length === 0 ? (
          <StyledLogLine>Loading...</StyledLogLine>
        ) : (
          <VRow
            style={{
              height: rowVirtualizer.getTotalSize(),
            }}
          >
            <VItem
              style={{
                transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
              }}
            >
              {virtualItems.map(virtualItem => {
                const log = logs[virtualItem.index]
                return (
                  <StyledLogLine key={virtualItem.key} ref={rowVirtualizer.measureElement} data-index={virtualItem.index}>
                    {log.level}: {log.msg}
                  </StyledLogLine>
                )
              })}
            </VItem>
          </VRow>
        )}
      </StyledLogs>
    </StyledLogsContainer>
  )
}
