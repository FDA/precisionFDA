import { backendCall } from '../utils/api'
import { queryYearList } from './yearList'
import { IExpert } from '../types/expert'


const getExperts = (data: any) => backendCall('/api/experts', 'GET', data)
const fetchExpertDetails = async (expertId: string): Promise<IExpert> => {
  const res = await backendCall(`/api/experts/${expertId}`, 'GET')

  return res?.payload
}
const askQuestion = (data: { userName: string, question: string }, expertId: string) => backendCall(`/api/experts/${expertId}/ask_question`, 'POST', data)

const queryExpertsYearList = () => {
  return queryYearList('/api/experts/years/')
}

export {
  getExperts,
  queryExpertsYearList,
  fetchExpertDetails,
  askQuestion,
}
