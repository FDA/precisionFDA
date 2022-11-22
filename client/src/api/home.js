import { backendCall } from '../utils/api'

export const getDatabaseAllowedInstances = (data) => backendCall('/api/dbclusters/allowed_instances', 'GET', data)
