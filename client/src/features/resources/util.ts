export const imageTypes = ['png', 'jpg', 'jpeg', 'gif']
export function isImageFromExt(ext: string) {
  return imageTypes.includes(ext)
}

export const getExt = (file: string) => file.substring(file.lastIndexOf('.')+1, file.length)

