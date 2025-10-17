import axios from 'axios'

export const createFile = (name: string, scope: string, folderId?: string | number) =>
  axios.post('/api/create_file', { name, scope, folder_id: folderId }).then(response => ({ status: response.status, payload: response.data }))

export const getUploadURL = (uid: string | number, index: number, size: number, md5: string) =>
  axios
    .get(`/api/v2/files/${uid}/upload-url`, { params: { index, size, md5 }})
    .then(response => ({ status: response.status, payload: response.data }))

export const uploadChunk = (url: string, chunk: Blob | ArrayBuffer | string, headers?: Record<string, string>) => {
  // Not using axios here to avoid header handling issues
  return fetch(url, {
    method: 'PUT',
    body: chunk,
    headers,
  }).then(response => {
    return { status: response.status, payload: null }
  })
}

export const closeFile = (uid: string) =>
  axios.post('/api/close_file', { uid }).then(response => ({ status: response.status, payload: response.data }))
