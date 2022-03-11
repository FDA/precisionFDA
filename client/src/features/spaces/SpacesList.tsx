import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import DefaultLayout from '../../views/layouts/DefaultLayout'
import { spacesListRequest } from './spaces.api'

export const Spaces2List = () => {
  const { data, status, refetch } = useQuery(['spaces'], () =>
    spacesListRequest(),
  )
  const spaces = data?.spaces
  return (
    <DefaultLayout>
      List
      {status === 'loading' && <div>Loading...</div>}
      {spaces && spaces.map(space => (
        <div key={space.id}><Link to={{pathname: `/spaces/files?space_id=${space.id}`}}>{space.name}</Link></div>
      ))}
    </DefaultLayout>
  )
}
