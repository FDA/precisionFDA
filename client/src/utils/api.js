import queryString from 'query-string'


const getAuthenticityToken = () => {
  const CSRFHolder = document.getElementsByName('csrf-token')[0]

  return CSRFHolder ? CSRFHolder.content : null
}

const backendCall = (route, method = 'POST', data = {}, token = getAuthenticityToken()) => {
  const opts = {
    method,
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    opts['body'] = JSON.stringify(data)
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
