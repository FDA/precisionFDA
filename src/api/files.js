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

export const createFile = (name, scope, folder_id) => (
  backendCall('/api/create_file', 'POST', { name, scope, folder_id })
)

export const getUploadURL = (id, index, size, md5) =>
  backendCall('/api/get_upload_url', 'POST', { id, index, size, md5 })

export const uploadChunk = (url, chunk, headers) => (
  fetch(url, {
    method: 'PUT',
    body: chunk,
    headers,
  })
)

export const closeFile = (id) =>
  backendCall('/api/close_file', 'POST', { id })

export {
  getApiCall,
  postApiCall,
  putApiCall,
  getFilesByAction,
}
