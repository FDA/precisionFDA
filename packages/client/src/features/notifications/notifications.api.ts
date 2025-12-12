import axios from 'axios'
import { Notification } from '../home/types'

export async function confirmNotification(id: number) {
  return axios.put(`/api/v2/notifications/${id}`)
}

export async function fetchUnreadNotifications() {
  return axios.get<Notification[]>('/api/v2/notifications/unread').then(r => r.data)
}
