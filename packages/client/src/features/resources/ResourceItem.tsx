import React from 'react'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { FileIcon } from '../../components/icons/FileIcon'
import { FileThumb } from './styles'
import { getExt, isImageFromExt } from './util'

const StyledResourceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
`

const ItemName = styled.span`
  flex: 1; // Ensure the name takes up remaining space
  margin-left: 16px;
  font-weight: bold;
`

const ImageContainer = styled.div`
  position: relative;
  width: 100px; // Fixed width to ensure alignment
  height: 100px; // Fixed height to ensure alignment
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`

const ResourceThumb = ({ url }: { url: string }) => {
  if (!url) {
    return (
      <FileThumb>
        <FileIcon height={80} />
        <div className="ext upload-error">Finishing upload</div>
      </FileThumb>
    )
  }
  const ext = getExt(url)
  if (isImageFromExt(ext)) {
    return <img src={url} alt="resource item" />
  }
  return (
    <FileThumb>
      <FileIcon height={80} />
      <div className="ext">{ext}</div>
    </FileThumb>
  )
}

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px; // Gap between the buttons
  margin-left: 16px; // Margin to create space between image and buttons
`

const StyledButton = styled(Button)`
  flex: 1;
  display: flex;
  justify-content: center;
  width: auto;
`

// @ts-ignore
const ResourceItem = ({ resource, canEdit, onRemove, onCopy }) => (
  <StyledResourceItem key={resource.id}>
    <ImageContainer data-tip data-for={`tip-${resource.id}`}>
      <ResourceThumb url={resource.url} />
    </ImageContainer>
    <ItemName>{resource.name}</ItemName>
    <ButtonContainer>
      {resource.url && (
        <StyledButton variant="primary" type="button" onClick={() => onCopy(resource.url)}>
          Copy Link
        </StyledButton>
      )}
      {canEdit && (
        <StyledButton variant="warning" type="button" onClick={() => onRemove(resource.id)}>
          Remove
        </StyledButton>
      )}
    </ButtonContainer>
  </StyledResourceItem>
)

export default ResourceItem
