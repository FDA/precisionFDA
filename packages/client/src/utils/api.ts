import axios from 'axios'
import { toastError, toastInfo, toastSuccess, toastWarning } from '../components/NotificationCenter/ToastHelper'

export enum MESSAGE_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

interface PayloadMessage {
  type: MESSAGE_TYPE
  text?: string | string[]
  message?: string
}

export interface Payload {
  message?: PayloadMessage
  meta?: {
    messages?: PayloadMessage[]
  }
  error?: {
    message: string
  }
}

const getMessageTexts = (message: PayloadMessage): string[] => {
  const text = message.text ?? message.message
  if (Array.isArray(text)) return text.filter(Boolean)
  return text ? [text] : []
}

const displayMessage = (message: PayloadMessage) => {
  const texts = getMessageTexts(message)

  texts.forEach(text => {
    switch (message.type) {
      case MESSAGE_TYPE.SUCCESS:
        toastSuccess(text)
        break
      case MESSAGE_TYPE.WARNING:
        toastWarning(text)
        break
      case MESSAGE_TYPE.INFO:
        toastInfo(text)
        break
      case MESSAGE_TYPE.ERROR:
        toastError(text)
        break
      default:
        break
    }
  })
}

export const displayPayloadMessage = (payload: Payload) => {
  // The response messaging from the API is a bit eclectic, as seen with the following scenarios that
  // we've seen (so far). Thus this function needs to be able to handle the delivery of messages to
  // the user under all scenarios.
  //
  // In general:                         { message: { type: "success", text: "hello" }}
  // /api/files/copy:                    { message: { type: "success", text: ["hello1", ... ]}}
  // /api/spaces/{id}/files/move_nodes:  { meta: { messages: [ { type: "success", message: "hello" }, ... ]}}

  // TODO: consolidate backend message format, perhaps making messages a string[] for all responses

  if (Array.isArray(payload.meta?.messages) && payload.meta.messages.length > 0) {
    payload.meta.messages.forEach(displayMessage)
  } else if (payload.message) {
    displayMessage(payload.message)
  } else if (payload.error) {
    toastError(payload.error.message)
  }
}

export const refreshSession = async (): Promise<void> => {
  return axios.get('/api/v2/session/refresh').then(() => {})
}
