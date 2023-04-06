import axios from 'axios'

export async function confirmNotification(id: number) {
    return axios.put(`/api/notifications/${id}`, { deliveredAt: new Date().toISOString() })
}
