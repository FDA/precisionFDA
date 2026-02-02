import axios from 'axios'
import { HomeScope } from './types'

export interface CounterRequest {
  apps: number
  assets: number
  dbclusters: number
  jobs: number
  files: number
  workflows: number
  reports: number
  discussions: number
}

export async function counterRequest(homeScope?: HomeScope): Promise<CounterRequest> {
  let apiRoute = '/api/v2/counters'
  if (homeScope && homeScope !== 'me') {
    apiRoute = `${apiRoute}/${homeScope}`
  }
  return axios.get(apiRoute).then(d => d.data)
}
