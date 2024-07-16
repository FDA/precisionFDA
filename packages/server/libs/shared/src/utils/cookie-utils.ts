export class CookieUtils {
  static getCookie(key: string, cookies: string): string {
    return this.parseCookies(cookies)[key]
  }

  static parseCookies(cookies: string): Record<string, string> {
    return cookies?.split(';').reduce((acc, cookie) => {
      const parts = cookie.split('=')
      const key = parts.shift().trim()
      const value = decodeURI(parts.join('='))

      if (key) {
        acc[key] = value
      }

      return acc
    }, {})
  }
}
