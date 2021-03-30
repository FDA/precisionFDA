import { backendCall } from '../utils/api'


const getChallenges = (data) => backendCall('/api/challenges', 'GET', data)
const getChallengesYearList = () => backendCall('/api/challenges/years', 'GET')
const getChallenge = (challengeId) => backendCall(`/api/challenges/${challengeId}`, 'GET')
const proposeChallenge = (data) => backendCall('/api/challenges/propose', 'POST', data)


export {
  getChallenges,
  getChallengesYearList,
  getChallenge,
  proposeChallenge,
}
