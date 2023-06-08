export function getCookie(name: string) {
  const cookieArr = document.cookie.split(';')
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=')
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1])
    }
  }
  return null
}
