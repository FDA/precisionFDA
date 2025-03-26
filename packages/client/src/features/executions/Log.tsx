/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import styled from 'styled-components'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../utils/config'
import { JobLogItem, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../home/types'
import { JobState } from './executions.types'
import { Button } from '../../components/Button'

const StyledLogsContainer = styled.div`
  padding: 4px 0 4px 12px;
  margin: 10px;
  border: 1px solid var(--c-layout-border);
  border-radius: 3px;
  position: relative;
`

const StyledLogs = styled.div`
  font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  overflow-y: scroll;
  max-height: 400px;
  padding: 8px;
`

const StyledLogLine = styled.p`
  line-height: 1.5;
`

const StyledDownloadButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 14px;
`

type ShowingLogItem = Pick<JobLogItem, 'source' | 'line' | 'level' | 'msg'>

const isStopSignal = (log: ShowingLogItem) => log.source === 'SYSTEM' && log.msg === 'END_LOG'

export const Logs = ({ jobUid, jobState }: { jobUid: string; jobState: JobState }) => {
  const [logs, setLogs] = useState<ShowingLogItem[]>([])
  const [isStreamingDone, setIsStreamingDone] = useState(false)
  const logRef = useRef<HTMLDivElement | null>(null)

  const { sendMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
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
  })

  useEffect(() => {
    if (jobState === 'running') {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
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
      <StyledDownloadButton data-variant="success" onClick={downloadLogs} disabled={logs.length === 0}>
        Download Log File
      </StyledDownloadButton>
      <StyledLogs ref={logRef}>
        {logs.length > 0 ? (
          logs.map(log => (
            <StyledLogLine key={`${log.line}-${log.level}`}>
              {log.level}: {log.msg}
            </StyledLogLine>
          ))
        ) : (
          <StyledLogLine>Loading...</StyledLogLine>
        )}
      </StyledLogs>
    </StyledLogsContainer>
  )
}
