import { toast } from 'react-toastify'

export enum MESSAGE_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
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

export const displayPayloadMessage = (payload: Payload) => {
  // The response messaging from the API is a bit eclectic, as seen with the following scenarios that
  // we've seen (so far). Thus this function needs to be able to handle the delivery of messages to
  // the user under all scenarios.
  //
  // In general:                         { message: { type: "success", text: "hello" }}
  // /api/files/copy:                    { message: { type: "success", text: ["hello1", ... ]}}
  // /api/spaces/{id}/files/move_nodes:  { meta: { messages: [ { type: "success", message: "hello" }, ... ]}}

  // TODO: consolidate backend message format, perhaps making messages a string[] for all responses

  const message = Array.isArray(payload.meta?.messages) ? payload.meta.messages[0] : payload.message
  if (message) {
    const errorMessage = Array.isArray(message.text) ? message.text[0] : (message.text ?? message.message)
    console.log(errorMessage)
    switch (message.type) {
      case MESSAGE_TYPE.SUCCESS:
        toast.success(errorMessage)
        break
      case MESSAGE_TYPE.WARNING:
        toast.warning(errorMessage)
        break
      case MESSAGE_TYPE.ERROR:
        toast.error(errorMessage)
        break
      default:
        break
    }
  } else if (payload.error) {
    toast.error(payload.error.message)
  }
}

export const getAuthenticityToken = () => {
  const CSRFHolder = document.getElementsByName('csrf-token')[0] as HTMLMetaElement
  return CSRFHolder ? CSRFHolder.content : null
}
