import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { PageContainer } from '../../../components/Page/styles'
import { useAuthUser } from '../../auth/useAuthUser'
import { acceptSpaceRequest } from '../spaces.api'
import { ISpace } from '../spaces.types'
import { SpaceHeaderDescrip, SpaceHeaderTitle, SpaceMainInfo } from './styles'
import { ProtectedIcon } from '../ProtectedIcon'
import { FdaRestrictedIcon } from '../FdaRestrictedIcon'
import { Button } from '../../../components/Button'
import { ApiErrorResponse } from '../../home/types'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`
const KeyVal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const Key = styled.div`
  font-weight: bold;
  font-size: 16px;
`
const Val = styled.div`
  font-size: 14px;
`
const State = styled.div`
  font-size: 14px;
  font-style: italic;
`
const AcceptSpaceWarning = styled.div`
  border: solid 1px #f0ad4e;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
`
const AlertText = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`
const ActionText = styled.div`
  font-size: 14px;
`
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 64px;
`

const acceptedLabel = (isAccepted: boolean) => (isAccepted ? 'Accepted' : 'Pending')

const hostLeadLabel = (spaceType: ISpace['type']) => `${spaceType === 'review' ? 'Reviewer Lead' : getHostLeadLabel(spaceType)}`

const guestLeadLabel = (spaceType: ISpace['type']) => {
  if (['review', 'groups', 'government', 'administrator'].includes(spaceType as string)) {
    return `${spaceType === 'review' ? 'Sponsor Lead' : getGuestLeadLabel(spaceType)}`
  }
  return ''
}

const getHostLeadLabel = (type: ISpace['type']): string => {
  if (type === 'review') {
    return 'Reviewer Lead'
  } else if (type === 'groups') {
    return 'Host Lead'
  }
  return ''
}

const getGuestLeadLabel = (type: ISpace['type']): string => {
  if (type === 'review') {
    return 'Reviewer Lead'
  } else if (type === 'groups') {
    return 'Guest Lead'
  }
  return ''
}

export function Activation({ space }: { space: ISpace }) {
  const queryCache = useQueryClient()
  const user = useAuthUser()

  const acceptSpaceMutation = useMutation({
    mutationKey: ['accept-space'],
    mutationFn: acceptSpaceRequest,
    onSuccess: res => {
      const response = res as ApiErrorResponse
      if (response?.error) {
        toastError('Error: Service is unavailable. Please try again later')
      } else {
        queryCache.invalidateQueries({
          queryKey: ['space', space.id.toString()],
        })
        toastSuccess('Successfully activated space')
      }
    },
  })
  const acceptClickHandler = () => {
    return acceptSpaceMutation.mutateAsync({ id: space.id })
  }

  const { name, description, created_at, id, type, host_lead, guest_lead } = space
  const currentUser = [host_lead, guest_lead].filter(u => u && u.id === user?.id)[0]
  const isAcceptedByUser = currentUser && currentUser.is_accepted
  const hostLabel = hostLeadLabel(type)
  const guestLabel = guestLeadLabel(type)

  const activationMessage = guest_lead
    ? `Both ${hostLabel} and ${guestLabel} must "Accept Space" to activate it.`
    : `${hostLabel} must "Accept Space" to activate it.`

  return (
    <PageContainer>
      <Col>
        <SpaceMainInfo>
          <SpaceHeaderTitle>{name}</SpaceHeaderTitle>
          <SpaceHeaderDescrip>
            {space.protected && <ProtectedIcon />}
            {space.restricted_reviewer && <FdaRestrictedIcon />}
            {description}
          </SpaceHeaderDescrip>
        </SpaceMainInfo>
        <Row>
          <KeyVal>
            <Key>{hostLabel}</Key>
            {host_lead && (
              <>
                <Val>{host_lead.name}</Val>
                <State>{acceptedLabel(host_lead.is_accepted)}</State>
              </>
            )}
          </KeyVal>

          <KeyVal>
            <Key>{guestLabel}</Key>
            {guest_lead && (
              <>
                <Val>{guest_lead.name}</Val>
                <State>{acceptedLabel(guest_lead.is_accepted)}</State>
              </>
            )}
          </KeyVal>

          <KeyVal>
            <Key>Created On</Key>
            <Val>{created_at}</Val>
          </KeyVal>

          <KeyVal>
            <Key>Space ID</Key>
            <Val>{id}</Val>
          </KeyVal>
        </Row>

        <AcceptSpaceWarning>
          <div>
            <AlertText>This space has not yet been activated.</AlertText>
            <ActionText>{activationMessage}</ActionText>
          </div>
          {!!currentUser && (
            <Button
              data-variant="success"
              disabled={isAcceptedByUser || acceptSpaceMutation.isPending}
              onClick={() => acceptClickHandler()}
            >
              {isAcceptedByUser ? 'Already accepted' : 'Accept Space'}
            </Button>
          )}
        </AcceptSpaceWarning>
        {acceptSpaceMutation.isPending && <Loader />}
      </Col>
    </PageContainer>
  )
}
