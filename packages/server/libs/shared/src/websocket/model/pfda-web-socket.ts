import { WebSocket } from 'ws'
import { UserContext } from '@shared/domain/user-context/model/user-context'

export interface PfdaWebSocket extends WebSocket {
  pfdaUserContext: UserContext
}

export enum WEBSOCKET_EVENTS {
  JOB_LOG = 'jobLog',
  NOTIFICATION = 'notification',
}
