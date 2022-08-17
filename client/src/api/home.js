import { backendCall } from '../utils/api'


const postApiCall = (url, data) => backendCall(url, 'POST', data)
const putApiCall = (url, data) => backendCall(url, 'PUT', data)
const deleteApiCall = (url, data) => backendCall(url, 'DELETE', data)
const patchApiCall = (url, data) => backendCall(url, 'PATCH', data)

const getApps = (data) => backendCall('/api/apps', 'GET', data)
const getAppsFeatured = (data) => backendCall('/api/apps/featured', 'GET', data)
const getAppsEverybody = (data) => backendCall('/api/apps/everybody', 'GET', data)
const getAppsSpaces = (data) => backendCall('/api/apps/spaces', 'GET', data)
const getAppDetails = (uid, data) => backendCall(`/api/apps/${uid}`, 'GET', data)
const getAppExecutions = (uid, data) => backendCall(`/api/apps/${uid}/jobs`, 'GET', data)

const getDatabases = (data) => backendCall('/api/dbclusters', 'GET', data)
const getDatabaseAllowedInstances = (data) => backendCall('/api/dbclusters/allowed_instances', 'GET', data)
const getDatabaseDetails = (dxid, data) => backendCall(`/api/dbclusters/${dxid}`, 'GET', data)
// const getDatabasesSpaces = (data) => backendCall('/api/databases/spaces', 'GET', data)

const getFiles = (data) => backendCall('/api/files', 'GET', data)
const getFilesFeatured = (data) => backendCall('/api/files/featured', 'GET', data)
const getFilesEverybody = (data) => backendCall('/api/files/everybody', 'GET', data)
const getFilesSpaces = (data) => backendCall('/api/files/spaces', 'GET', data)
const getFileDetails = (uid, data) => backendCall(`/api/files/${uid}`, 'GET', data)
const getSubfolders = (data) => backendCall('/api/folders/children', 'GET', data)

const getWorkflows = (data) => backendCall('/api/workflows', 'GET', data)
const getWorkflow = (uid, data) => backendCall(`/api/workflows/${uid}`, 'GET', data)
const getWorkflowsEveryone = (data) => backendCall('/api/workflows/everybody', 'GET', data)
const getWorkflowsFeatured = (data) => backendCall('/api/workflows/featured', 'GET', data)
const getWorkflowsSpaces = (data) => backendCall('/api/workflows/spaces', 'GET', data)
const getWorkflowExecutions = (uid, data) => backendCall(`/api/workflows/${uid}/jobs`, 'GET', data)
const getWorkflowDetails = (uid, data) => backendCall(`/api/workflows/${uid}`, 'GET', data)
const getWorkflowDiagram = (uid, data) => backendCall(`/api/workflows/${uid}/diagram`, 'GET', data)

const getExecutions = (data) => backendCall('/api/jobs', 'GET', data)
const getExecutionsSpaces = (data) => backendCall('/api/jobs/spaces', 'GET', data)
const getExecutionsEverybody = (data) => backendCall('/api/jobs/everybody', 'GET', data)
const getExecutionsFeatured = (data) => backendCall('/api/jobs/featured', 'GET', data)
const getExecutionDetails = (uid, data) => backendCall(`/api/jobs/${uid}`, 'GET', data)

const getAssets = (data) => backendCall('/api/assets', 'GET', data)
const getAssetsFeatured = (data) => backendCall('/api/assets/featured', 'GET', data)
const getAssetsEverybody = (data) => backendCall('/api/assets/everybody', 'GET', data)
const getAssetsSpaces = (data) => backendCall('/api/assets/spaces', 'GET', data)
const getAssetDetails = (uid, data) => backendCall(`/api/assets/${uid}`, 'GET', data)

export {
  getApps,
  getAppsFeatured,
  getAppsEverybody,
  getAppsSpaces,
  getAppDetails,
  getDatabases,
  getDatabaseAllowedInstances,
  getDatabaseDetails,
  postApiCall,
  patchApiCall,
  putApiCall,
  deleteApiCall,
  getFiles,
  getFilesFeatured,
  getFilesEverybody,
  getFilesSpaces,
  getFileDetails,
  getSubfolders,
  getWorkflows,
  getWorkflow,
  getWorkflowsFeatured,
  getWorkflowsEveryone,
  getWorkflowsSpaces,
  getExecutions,
  getExecutionsSpaces,
  getExecutionsEverybody,
  getExecutionsFeatured,
  getExecutionDetails,
  getAppExecutions,
  getWorkflowDetails,
  getWorkflowDiagram,
  getWorkflowExecutions,
  getAssets,
  getAssetsFeatured,
  getAssetsEverybody,
  getAssetsSpaces,
  getAssetDetails,
}
