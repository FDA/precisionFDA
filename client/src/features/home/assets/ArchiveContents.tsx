import React from 'react'
import styled from 'styled-components'

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`

const Item = styled.li`
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  padding: 10px 15px;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid #ddd;
`

const Label = styled(Item)`
  text-transform: uppercase;
  color: #8198bc;
  font-weight: 300;
`

export const ArchiveContents = ({ data = [] }: { data: string[] }) => {
  if (!data.length) {
    return <div>No archive contents</div>
  }

  return (
    <Ul>
      <Label>Files Only</Label>
      {data.map((e, i) => (
        <Item key={i}>{e}</Item>
      ))}
    </Ul>
  )
}
