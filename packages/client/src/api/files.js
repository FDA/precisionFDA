import { backendCall } from '../utils/api'

export const createFile = (name, scope, folder_id) =>
  backendCall('/api/create_file', 'POST', {
    name,
    scope,
    folder_id,
  })

export const getUploadURL = (id, index, size, md5) =>
  backendCall('/api/get_upload_url', 'POST', {
    id,
    index,
    size,
    md5,
  })

export const uploadChunk = (url, chunk, headers) =>
  fetch(url, {
    method: 'PUT',
    body: chunk,
    headers,
  })

export const closeFile = uid => backendCall('/api/close_file', 'POST', { uid })
