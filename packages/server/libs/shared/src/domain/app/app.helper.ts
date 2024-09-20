export const constructDxid = (username: string, appName: string, scope?: string): string => {
  return `app-${constructDxName(username, appName, scope)}`
}

export const constructDxName = (username: string, appName: string, scope?: string): string => {
  return `${username}-${appName}-${scope}`
}
