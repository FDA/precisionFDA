import { WebSocket } from 'ws'

export interface PfdaWebSocket extends WebSocket {
  PFDA_AUTH_TOKEN: string
}

export enum WEBSOCKET_EVENTS {
  JOB_LOG = 'jobLog',
  NOTIFICATION = 'notification',
}
