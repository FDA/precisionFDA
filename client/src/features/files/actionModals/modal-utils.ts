import { DownloadListResponse } from '../../home/types'

export const getPluralizedTerm = (itemCount: number, itemName: string): string => {
  if (itemCount === 1) {
    return `${itemCount.toString()} ${itemName}`
  }
  return `${itemCount.toString()} ${itemName}s`
}

export const getMessage = (nodes?: DownloadListResponse[]) => {
  let filesCount = 0
  let foldersCount = 0

  nodes?.forEach(node => {
    if (node.type === 'file') {
      filesCount += 1
    } else {
      foldersCount += 1
    }
  })

  if (foldersCount > 0 && filesCount === 0) {
    return `${getPluralizedTerm(foldersCount, 'folder')}`
  }
  if (filesCount > 0 && foldersCount === 0) {
    return `${getPluralizedTerm(filesCount, 'file')}`
  }
  return `${getPluralizedTerm(filesCount, 'file')} and `
    + `${getPluralizedTerm(foldersCount, 'folder')}`
}
