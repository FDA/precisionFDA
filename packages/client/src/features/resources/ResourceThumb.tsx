import React from 'react'
import { FileThumb } from './styles'
import { FileIcon } from '../../components/icons/FileIcon'
import { getExt, isImageFromExt } from './util'
import { Resource } from './types'

export const ResourceThumb = ({ url }: { url: Resource['url'] }) => {
  if(!url) return <FileThumb><FileIcon height={80} /><div className="ext upload-error">Finishing upload</div></FileThumb>
  const ext = getExt(url)
  if(isImageFromExt(ext)) {
    return <img src={url} alt="resource item" />
  }
  return <FileThumb><FileIcon height={80} /><div className="ext">{ext}</div></FileThumb>
}
