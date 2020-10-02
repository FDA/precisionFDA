import { backendCall } from '../utils/api'


const getApps = (data) => backendCall('/api/apps', 'GET', data)

const getAppsFeatured = (data) => backendCall('/api/apps/featured', 'GET', data)


export {
  getApps,
  getAppsFeatured,
}
