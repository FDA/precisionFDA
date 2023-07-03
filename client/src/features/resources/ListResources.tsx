import React from 'react'
import styled, { css } from 'styled-components'
import { TransparentButton } from '../../components/Button'
import { Loader } from '../../components/Loader'

const StyledResourceItem = styled.div`
  max-width: 100px;

  img {
    width: 100%;
  }
`
const ResourceList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: 4px;
  max-width: 500px;
`

const Item = styled(TransparentButton)<{ isSelected?: boolean }>`
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 3px solid blue;
    `}
`

const ListResources = ({
  resourceList,
  onRemove,
  isLoading,
}: {
  isLoading?: boolean
  resourceList: Array<{id: number, url: string}>
  onRemove: (id: number) => void
}) => {
  if (isLoading) return <Loader />

  return (
    <ResourceList>
      {resourceList?.map(re => {
        return (
          <StyledResourceItem key={re.id}>
            <Item>
              <img src={re.url} alt="resource item" />
            </Item>
            <TransparentButton type="button" onClick={() => onRemove(re.id)}>
              Remove
            </TransparentButton>
          </StyledResourceItem>
        )
      })}
    </ResourceList>
  )
}

export default ListResources
