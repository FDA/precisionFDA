import queryString from 'query-string'

export const requestOpts: RequestInit = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
}

export function checkStatus(res: Response) {
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res;
}

export const getAuthenticityToken = () => {
  const CSRFHolder: any = document.getElementsByName('csrf-token')[0]
  return CSRFHolder ? CSRFHolder.content : null
}

const backendCall = (route: string, method = 'POST', data = {}, token = getAuthenticityToken()) => {
  const opts: RequestInit = {
    method,
    ...requestOpts
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    opts['body'] = JSON.stringify(data)
    // @ts-ignore
    opts['headers']['X-CSRF-Token'] = token
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

export {
  backendCall,
}
