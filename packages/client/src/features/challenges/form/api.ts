import axios from 'axios'


export interface ProposeChallengePayload {
  name: string,
  email: string,
  organisation: string,
  specific_question: boolean,
  specific_question_text: string,
  data_details: boolean,
  data_details_text: string,
}

export async function proposeChallengeRequest(payload: ProposeChallengePayload) {
  return axios.post('/api/challenges/propose', payload).then(r => r.data)
}

export async function fetchScoringAppUsers(): Promise<[]> {
  return axios.get('/api/challenges/scoring_app_users').then(r => r.data)
}

export async function fetchHostLeads(): Promise<[]> {
  return axios.get('/api/challenges/host_lead_users').then(r => r.data)
}

export async function fetchActiveUsers(): Promise<[]> {
  return axios.get('/api/users/active').then(r => r.data)
}

export async function fetchGuestLeads(): Promise<[]> {
  return axios.get('/api/challenges/guest_lead_users').then(r => r.data)
}

export async function fetchChallengeScopes(): Promise<string[]> {
  return axios.get('/api/challenges/scopes_for_select').then(r => r.data)
}

export async function fetchChallengeOrders() {
  return axios.get('/api/challenges/challenges_for_select').then(r => r.data)
}

