import React from 'react'
import { useLocation } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import { InvitationsTable } from './InvitationsTable'
import { useInvitationColumns } from './useInvitationColumns'

export const ProvisioningList = () => {
  const [ids] = useQueryParam('invitations', StringParam)
  const location = useLocation()
  const columns = useInvitationColumns(false)

  const breadcrumbs = [
    {
      path: '/admin/users',
      name: 'Users',
    },
    {
      path: '/admin/invitations',
      name: 'Invitations',
    },
    {
      path: `${location.pathname}${location.search}`,
      name: 'Provisioning',
    },
  ]

  if (!ids) {
    return <div>No provisioning invitations found</div>
  }

  return (
    <InvitationsTable breadcrumbs={breadcrumbs} title="Provisioning invitations" columns={columns} additionalParams={{ ids }} />
  )
}
