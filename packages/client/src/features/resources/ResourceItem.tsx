import React from 'react'
import { FileIcon } from '../../components/icons/FileIcon'
import { Resource } from '../data-portals/resources/resources.types'
import { FileThumbSmall, ImageContainer, ItemName, StyledResourceItem } from './styles'
import { getExt, isImageFromExt } from './util'


const ResourceThumb = ({ url }: { url: string }) => {
  if (!url) {
    return (
      <FileThumbSmall>
        <FileIcon height={20} />
        <div className="ext upload-error">Finishing upload</div>
      </FileThumbSmall>
    )
  }
  const ext = getExt(url)
  if (isImageFromExt(ext)) {
    return <img loading="lazy" src={url} alt="resource item" />
  }
  return (
    <FileThumbSmall>
      <FileIcon height={20} />
      <div className="ext">{ext}</div>
    </FileThumbSmall>
  )
}

const ResourceItem = ({ resource, onClick }: { onClick: (id: number) => void, resource: Resource }) => (
  <StyledResourceItem onClick={() => onClick(resource.id)} isDeleting={resource.isDeleting}>
    <ImageContainer>
      <ResourceThumb url={resource.url} />
    </ImageContainer>
    <ItemName>{resource.name}</ItemName>
  </StyledResourceItem>
)

export default ResourceItem
