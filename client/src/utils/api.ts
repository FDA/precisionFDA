import httpStatusCodes from 'http-status-codes'
import queryString from 'query-string'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'

export const requestOpts: RequestInit = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
}

export const unauthorizedHandler = () => {
const history = useHistory()
toast.error('Session expired. Please log in again', {
  toastId: '401 toast',
  position: toast.POSITION.TOP_CENTER,
  autoClose: false,
  closeOnClick: false,
  onClick: () => history.push('/login'),
})
}
// TODO: separate app errors from network errors.
// Application errors, like validations, should not throw Error.
// They should return error in the api response as an object of errors.
export const checkStatus = async (res: Response) => {
  if (!res.ok) {
    if (res.status === httpStatusCodes.UNAUTHORIZED) {
      unauthorizedHandler()
    } else {
      let message = `${res.status}: ${res.statusText}`
      try {
        const payload = await res.json()
        message = payload.error?.message ?? payload.message?.text ?? payload.error
        if (res.status === httpStatusCodes.UNPROCESSABLE_ENTITY) {
          toast.error(message, {
            toastId: '422 toast',
            position: toast.POSITION.TOP_RIGHT,
            closeOnClick: true,
          })
        }
      }
      catch {
        // This code path is for certain API routes/errors where the Ruby backend returns a page and not a json
        throw new Error(message)
      }
      return { error: message }
    }
  }
  return res
}

export enum MESSAGE_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export const displayResponseMessage = async (res: Response) => {
  const payload = await res.json()
  displayResponseMessage(payload)
}

export const displayPayloadMessage = (payload: any) => {
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
  }
  else if (payload.error) {
    toast.error(payload.error.message)
  }
}

export const getAuthenticityToken = () => {
  const CSRFHolder: any = document.getElementsByName('csrf-token')[0]
  return CSRFHolder ? CSRFHolder.content : null
}

export const getApiRequestOpts = (method: string, token: string = getAuthenticityToken()) => {
  const opts: RequestInit = {
    method,
    ...requestOpts,
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // The CSRF-Token only affects staging and production, checked by 'protect_from_forgery' in Rails
    // @ts-ignore
    opts['headers']['X-CSRF-Token'] = token
  }
  return opts
}

/**
 * @deprecated Use axios library instead.
 */
const backendCall = (route: string, method = 'POST', data = {}, token = getAuthenticityToken()) => {
  const opts: RequestInit = getApiRequestOpts(method, token)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    opts['body'] = JSON.stringify(data)
  } else if (['GET', 'HEAD'].includes(method)) {
    route = queryString.stringifyUrl({ url: route, query: data })
  }

  return fetch(route, opts)
    .then(response => {
      return response.json()
        .then(payload => Promise.resolve({ status: response.status, payload }))
        .catch(() => Promise.resolve({ status: response.status, payload: null }))
    })
}

export { backendCall }
