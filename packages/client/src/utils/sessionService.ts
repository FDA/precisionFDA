import axios from 'axios'
import { throttle } from 'lodash'

/**
 * Keeps refreshing session on user activity (mouse move, keyboard)
 */
class SessionService {
  private readonly checkIntervalTime = 15000 // ms

  private refreshSession = throttle(() => {
    axios.get('/api/v2/session/refresh')
  }, this.checkIntervalTime)

  public startSessionRefreshing() {
    this.stopSessionRefreshing() // Ensure cleanup before starting

    window.addEventListener('keydown', this.refreshSession)
    window.addEventListener('mousemove', this.refreshSession)
  }

  public stopSessionRefreshing() {
    window.removeEventListener('keydown', this.refreshSession)
    window.removeEventListener('mousemove', this.refreshSession)
  }
}

export const sessionService = new SessionService()