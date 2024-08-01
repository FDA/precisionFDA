export class URLUtils {
  static replaceReturnURLForSSO(ssoURL, returnTo: string): string {
    if (!this.isValidReturnURL(returnTo)) {
      return ssoURL
    }
    const ssoURLObject = new URL(ssoURL)
    const targetResourceURL = new URL(ssoURLObject.searchParams.get('TargetResource'))
    const newRedirectUri = `${targetResourceURL.searchParams.get('redirect_uri')}=${returnTo}`
    targetResourceURL.searchParams.set('redirect_uri', newRedirectUri)
    ssoURLObject.searchParams.set('TargetResource', targetResourceURL.toString())
    return ssoURLObject.toString()
  }

  static isValidReturnURL(returnURL: string): boolean {
    const pathRegex = /^[\/?#]\w+/
    return pathRegex.test(returnURL)
  }
}
