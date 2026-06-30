import axios from 'axios'

export interface ProposeChallengePayload {
  name: string
  email: string
  organisation: string
  specificQuestion: boolean
  specificQuestionText: string
  dataDetails: boolean
  dataDetailsText: string
  captchaValue?: string
}

export async function proposeChallengeRequest(payload: ProposeChallengePayload) {
  return axios.post('/api/v2/challenges/propose', payload).then(r => r.data)
}

export async function fetchScoringAppUsers(): Promise<[]> {
  return axios.get('/api/challenges/scoring_app_users').then(r => r.data)
}

export type ChallengeLeadsResponse = {
  hostUsernames: string[]
  guestUsernames: string[]
}

export async function fetchChallengeLeads(): Promise<ChallengeLeadsResponse> {
  return axios.get('/api/v2/admin/memberships/challenge-leads').then(r => r.data)
}

export async function fetchHostLeads(): Promise<string[]> {
  return fetchChallengeLeads().then(r => r.hostUsernames)
}

export async function fetchGuestLeads(): Promise<string[]> {
  return fetchChallengeLeads().then(r => r.guestUsernames)
}

export async function fetchChallengeScopes(): Promise<string[]> {
  return axios.get('/api/challenges/scopes_for_select').then(r => r.data)
}
