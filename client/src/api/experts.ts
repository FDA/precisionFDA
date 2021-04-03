import { backendCall } from '../utils/api'


const getExperts = (data: any) => backendCall('/api/experts', 'GET', data)
const getExpertsYearList = () => backendCall('/api/experts/years', 'GET')

export {
  getExperts,
  getExpertsYearList
}
