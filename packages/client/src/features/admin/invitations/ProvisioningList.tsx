import React from 'react'
import { useSearchParams } from 'react-router'
import { InvitationsTable } from './InvitationsTable'
import { useInvitationColumns } from './useInvitationColumns'

export const ProvisioningList = () => {
  const [searchParams] = useSearchParams()
  const ids = searchParams.get('invitations')
  const columns = useInvitationColumns(false)

  if (!ids) {
    return <div>No provisioning invitations found</div>
  }

  return <InvitationsTable title="Provisioning invitations" columns={columns} additionalParams={{ ids }} />
}
