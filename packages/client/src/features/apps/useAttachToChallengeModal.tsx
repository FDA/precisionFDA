import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CircleCheckIcon } from '../../components/icons/CircleCheckIcon'
import { TrophyIcon } from '../../components/icons/TrophyIcon'
import { Loader } from '../../components/Loader'
import { breakPoints } from '../../styles/theme'
import { displayPayloadMessage, Payload } from '../../utils/api'
import { CheckCol, ColBody, HeaderRow, Table, TableRow, TitleCol } from '../modal/ModalCheckList'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { APIResource } from '../home/types'
import { assignToChallengeRequest, fetchApp } from './apps.api'
import { IApp } from './apps.types'
import { Button } from '../../components/Button'
import { toastError } from '../../components/NotificationCenter/ToastHelper'

const StyledCheckCol = styled(CheckCol)`
  justify-content: flex-end;
`
const CheckedColBody = styled(ColBody)`
  justify-content: flex-end;
`

const ChallengesList = ({
  selected,
  appUid,
  onSelect,
}: {
  selected?: string
  appUid: string
  onSelect: (scope: string) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['app', appUid],
    queryFn: () => fetchApp(appUid),
  })
  const meta = data?.meta
  if (isLoading) return <div>Loading...</div>
  if (meta?.challenges.length === 0) return <div>No challenges yet.</div>

  return (
    <Table>
      <tbody>
        <HeaderRow>
          <CheckCol />
        </HeaderRow>
        {meta!.challenges.map((s, i) => (
          <TableRow $isSelected={selected === s.id.toString()} key={i} onClick={() => onSelect(s.id.toString())}>
            <TitleCol>
              <ColBody>
                <TrophyIcon height={14} />
                {s.name}
              </ColBody>
            </TitleCol>
            <StyledCheckCol>
              <CheckedColBody>{selected === s.id.toString() && <CircleCheckIcon height={16} />}</CheckedColBody>
            </StyledCheckCol>
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  @media (min-width: ${breakPoints.small}px) {
    min-width: 300px;
    width: auto;
  }
`

const ChallengeAppForm = ({
  app,
  setShowModal,
  onSuccess,
}: {
  resource: APIResource
  app: IApp
  setShowModal: (show: boolean) => void
  onSuccess?: (res: unknown) => void
}) => {
  const [selectedId, setSelectedId] = useState<string>()

  const mutation = useMutation({
    mutationKey: ['challenge-app-form'],
    mutationFn: assignToChallengeRequest,
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res as Payload)
    },
    onError: error => {
      toastError(error.message)
    },
  })

  const handleSelect = (f: string) => {
    if (f === selectedId) {
      setSelectedId(undefined)
    } else {
      setSelectedId(f)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedId) {
      mutation.mutateAsync({
        link: app.links.assign_app,
        appId: app.id,
        challengeId: selectedId,
      })
    }
  }
  return (
    <>
      <ModalScroll>
        <StyledForm id="attach-to-challenge-form" onSubmit={handleSubmit}>
          <ChallengesList appUid={app.uid} selected={selectedId} onSelect={handleSelect} />
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader height={14} />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            form="attach-to-challenge-form"
            disabled={!selectedId || mutation.isPending}
          >
            Assign
          </Button>
        </ButtonRow>
      </Footer>
    </>
  )
}

export function useAttachToChallengeModal({
  resource,
  selected,
  onSuccess,
}: {
  resource: APIResource
  selected: IApp
  onSuccess?: (res: unknown) => void
}) {
  const { isShown, setShowModal } = useModal()

  const modalComp = (
    <ModalNext
      id="attach-to-challenge-modal"
      data-testid={`modal-${resource}-attach-to-challenge`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop disableClose={false} headerText="Assign to challenge: " hide={() => setShowModal(false)} />
      <ChallengeAppForm resource={resource} app={selected} setShowModal={setShowModal} onSuccess={onSuccess} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
