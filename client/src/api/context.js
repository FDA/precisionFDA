import { backendCall } from '../utils/api'


const fetchContext = () => backendCall('/api/user', 'GET')

export {
  fetchContext,
}
