import { backendCall } from '../utils/api'
import { queryYearList } from './yearList'


const getChallenges = (data) => backendCall('/api/challenges', 'GET', data)
const getChallenge = (challengeId) => backendCall(`/api/challenges/${challengeId}`, 'GET')
const proposeChallenge = (data) => backendCall('/api/challenges/propose', 'POST', data)

const queryChallengesYearList = () => {
  return queryYearList('/api/challenges/years/')
}

export {
  getChallenges,
  getChallenge,
  proposeChallenge,
  queryChallengesYearList,
}
