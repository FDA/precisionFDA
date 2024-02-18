import axios from 'axios'
import { Alert } from './alerts.types'

export function createAlertRequest(data: any) {
  return axios.post('/api/alerts', { alert: data }).then(d => d.data)
}

export function getAlertRequest() {
  return axios.get<Alert[]>('/api/alerts').then(d => d.data)
}

export function deleteAlertRequest(id: number) {
  return axios.delete(`/api/alerts/${id}`).then(d => d.data)
}

export function updateAlertRequest(id: number, data: any) {
  return axios.put(`/api/alerts/${id}`, { alert: data }).then(d => d.data)
}
