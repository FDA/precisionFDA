import { backendCall } from '../utils/api'
import { queryYearList } from './yearList'


const getExperts = (data: any) => backendCall('/api/experts', 'GET', data)

const queryExpertsYearList = () => {
  return queryYearList('/api/experts/years/')
}


export {
  getExperts,
  queryExpertsYearList,
}
