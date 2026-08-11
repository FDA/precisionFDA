import axios from 'axios'
import type { Notification } from '../home/types'

export async function confirmNotification(id: number) {
  return axios.put(`/api/v2/notifications/${id}`)
}

export async function fetchAndMarkDelivered() {
  return axios.post<Notification[]>('/api/v2/notifications/unread/deliver').then(r => r.data)
}
