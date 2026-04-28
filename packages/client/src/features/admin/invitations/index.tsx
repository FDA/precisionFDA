import React from 'react'
import { InvitationsTable } from './InvitationsTable'
import { useInvitationColumns } from './useInvitationColumns'

export const InvitationsList = () => {
  const columns = useInvitationColumns(true)

  return <InvitationsTable columns={columns} title="Invitation Management" />
}
