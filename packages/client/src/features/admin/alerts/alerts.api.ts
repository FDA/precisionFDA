import axios from 'axios'
import { Alert } from './alerts.types'

import type { AlertFormType } from './EditAlertForm'

export function createAlertRequest(data: AlertFormType) {
  return axios.post('/api/alerts', { alert: data }).then(d => d.data)
}

export function getAlertRequest() {
  return axios.get<Alert[]>('/api/alerts').then(d => d.data)
}

export function deleteAlertRequest(id: number) {
  return axios.delete(`/api/alerts/${id}`).then(d => d.data)
}

export function updateAlertRequest(id: number, data: AlertFormType) {
  return axios.put(`/api/alerts/${id}`, { alert: data }).then(d => d.data)
}
