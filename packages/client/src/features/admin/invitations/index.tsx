import React from 'react'
import { InvitationsTable } from './InvitationsTable'
import { useInvitationColumns } from './useInvitationColumns'

export const InvitationsList = () => {
  const columns = useInvitationColumns(true)
  const breadcrumbs = [
    {
      path: '/admin/users',
      name: 'Users',
    },
    {
      path: '/admin/invitations',
      name: 'Invitations',
    },
  ]

  return <InvitationsTable breadcrumbs={breadcrumbs} columns={columns} title="Invitation Management" />
}
