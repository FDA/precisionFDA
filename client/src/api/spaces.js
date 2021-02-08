import { backendCall } from '../utils/api'


const postApiCall = (url, data) => backendCall(url, 'POST', data)
const putApiCall = (url, data) => backendCall(url, 'PUT', data)

const getSpaces = (data) => backendCall('/api/spaces', 'GET', data)
const getSpace = (spaceId) => backendCall(`/api/spaces/${spaceId}`, 'GET')
const getFiles = (spaceId, data) => backendCall(`/api/files?space_id=${spaceId}`, 'GET', data)
const getApps = (spaceId, data) => backendCall(`/api/apps?space_id=${spaceId}`, 'GET', data)
const getJobs = (spaceId, data) => backendCall(`/api/jobs?space_id=${spaceId}`, 'GET', data)
const getWorkflows = (spaceId, data) => backendCall(`/api/workflows?space_id=${spaceId}`, 'GET', data)
const getMembers = (spaceId, data) => backendCall(`/api/spaces/${spaceId}/members`, 'GET', data)
const toggleLockSpace = (url) => backendCall(url, 'POST')

const createSpace = (route, data) => backendCall(route, 'POST', data)

const fetchNewSpaceInfo = (route) => backendCall(route, 'GET')

const acceptSpace = route => backendCall(route, 'POST')

const getSubfolders = (spaceId, folderId) => {
  const data = { folder_id: folderId }

  if (folderId === 0) {
    delete data.folder_id
  }

  return backendCall(`/api/spaces/${spaceId}/files/subfolders`, 'GET', data)
}

export const getNodes = (folderId) => {
  const data = {}

  if (folderId > 0) {
    data.folder_id = folderId
  }

  return backendCall('/api/folders/children', 'GET', data)
}

const moveNodes = (route, nodeIds, targetId) => {
  const data = { node_ids: nodeIds, target_id: targetId }
  return backendCall(route, 'POST', data)
}

export {
  postApiCall,
  putApiCall,
  getSpaces,
  toggleLockSpace,
  getSpace,
  getFiles,
  getApps,
  getJobs,
  getWorkflows,
  getMembers,
  createSpace,
  fetchNewSpaceInfo,
  acceptSpace,
  getSubfolders,
  moveNodes,
}
