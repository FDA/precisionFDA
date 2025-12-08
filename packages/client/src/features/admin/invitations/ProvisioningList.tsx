import React from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { InvitationsTable } from './InvitationsTable'
import { useInvitationColumns } from './useInvitationColumns'

export const ProvisioningList = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const ids = searchParams.get('invitations')
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
