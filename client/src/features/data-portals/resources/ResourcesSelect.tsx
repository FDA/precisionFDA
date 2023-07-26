import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { TransparentButton } from '../../../components/Button'
import { getExt, isImageFromExt } from '../../resources/util'

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

const Item = styled(TransparentButton)<{ isSelected: boolean }>`
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 3px solid blue;
    `}
`

const ResourcesSelect = ({
  list,
  onChange,
}: {
  list: Array<{ id: number; url: string }>
  onChange: (url: string) => void
}) => {
  const [selected, setSelected] = useState<number>()

  const handleSelect = (id: number, url: string) => {
    setSelected(id)
    onChange(url)
  }

  return (
    <ResourceList>
      {list?.filter((f) => isImageFromExt(getExt(f.url))).map(re => {
        return (
          <StyledResourceItem key={re.id}>
            <Item
              isSelected={selected === re.id}
              onClick={() => handleSelect(re.id, re.url)}
            >
              <img src={re.url} alt="resource item" />
            </Item>
          </StyledResourceItem>
        )
      })}
    </ResourceList>
  )
}

export default ResourcesSelect
