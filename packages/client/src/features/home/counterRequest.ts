import axios from 'axios'
import { HomeScope } from './types'

export interface CounterRequest {
  apps: string
  assets: string
  dbclusters: string
  jobs: string
  files: string
  workflows: string
  reports: string
  discussions: string
}

export async function counterRequest(homeScope?: HomeScope): Promise<CounterRequest> {
  let apiRoute = '/api/counters'
  if (homeScope && homeScope !== 'me') {
    apiRoute = `${apiRoute}/${homeScope}`
  }
  return axios.get(apiRoute).then(d => d.data)
}
