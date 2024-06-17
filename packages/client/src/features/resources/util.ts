import { Resource } from './resources.types'

export const imageTypes = ['.png', '.jpg', '.jpeg', '.gif']
export function isImageFromExt(ext: string) {
  return imageTypes.includes(ext)
}

export const getExt = (url: Resource['url']) => {
  if (!url) {
    return ''
  }

  try {
    const path = new URL(url).pathname

    const extensionRegex = /\.([a-zA-Z0-9]+)$/
    const matches = path.match(extensionRegex)
    return matches ? matches[0] : ''
  } catch {
    return ''
  }
}

export const getFileNameFromUrl = (url: Resource['url']) => {
  if(!url) {
    return ''
  }
  return url.substring(url.lastIndexOf('/')+1)
}
