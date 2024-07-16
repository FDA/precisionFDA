import React, { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import styled from 'styled-components'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../utils/config'
import { JobLogItem, WEBSOCKET_MESSSAGE_TYPE, WebSocketMessage } from '../home/types'
import { JobState } from './executions.types'

const StyledLogsContainer = styled.div`
  padding: 4px 0px 4px 12px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  position: relative;
`

const StyledLogs = styled.div`
  font-family: 'PT Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  overflow-y: scroll;
  max-height: 400px;
`

const StyledLogLine = styled.p`
  line-height: 1.5;
`

type ShowingLogItem = Pick<JobLogItem, 'source' | 'line' | 'level' | 'msg'>

const isStopSignal = (log: ShowingLogItem) => {
  return log.source === 'SYSTEM' && log.msg === 'END_LOG'
}

const LogByWs = ({ jobUid, jobState }: { jobUid: string; jobState: JobState }) => {
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
        return data.type === WEBSOCKET_MESSSAGE_TYPE.JOB_LOG
      } catch (e) {
        return false
      }
    },
    onOpen: () => {
      if (!isStreamingDone && jobUid) {
        sendMessage(JSON.stringify({ event: WEBSOCKET_MESSSAGE_TYPE.JOB_LOG, data: { jobUid } }))
      }
    },
    onMessage: message => {
      let messageData = {} as WebSocketMessage
      try {
        messageData = JSON.parse(message.data)
      } catch (e) {}
      if (messageData.type === WEBSOCKET_MESSSAGE_TYPE.JOB_LOG) {
        const newLog = messageData.data as JobLogItem
        if (isStopSignal(newLog)) {
          setIsStreamingDone(true)
          if (logs.length === 0) {
            setLogs([{ level: 'INFO', msg: 'No logs found', line: 0, source: 'client' }])
          }
          return
        }
        setLogs(prevLogs =>
          prevLogs.concat({
            level: newLog.level,
            msg: newLog.msg,
            line: newLog.line,
            source: newLog.source,
          }),
        )
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
  return (
    <>
      <StyledLogs ref={logRef}>
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <StyledLogLine key={`${log.line}-${i}`}>
              {log.level}: {log.msg}
            </StyledLogLine>
          ))
        ) : (
          <StyledLogLine>Loading...</StyledLogLine>
        )}
      </StyledLogs>
    </>
  )
}

export const Logs = ({ jobUid, jobState }: { jobUid: string; jobState: JobState }) => {
  return (
    <StyledLogsContainer>
      <LogByWs jobUid={jobUid} jobState={jobState} />
    </StyledLogsContainer>
  )
}
