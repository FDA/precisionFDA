import { backendCall } from '../utils/api'


const getApiCall = (url) => backendCall(url, 'GET')

const postApiCall = (url, data) => backendCall(url, 'POST', data)

const putApiCall = (url, data) => backendCall(url, 'PUT', data)

const getFilesByAction = (ids, action, scope) => {
  const data = {
    task: action,
    ids,
    scope,
  }
  return backendCall('/api/files/download_list', 'POST', data)
}

export {
  getApiCall,
  postApiCall,
  putApiCall,
  getFilesByAction,
}
