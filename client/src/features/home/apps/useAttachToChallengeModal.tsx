import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { CircleCheckIcon } from '../../../components/icons/CircleCheckIcon'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { Loader } from '../../../components/Loader'
import { breakPoints } from '../../../styles/theme'
import { checkStatus, displayPayloadMessage, getApiRequestOpts } from '../../../utils/api'
import { Modal } from '../../modal'
import { CheckCol, Col, ColBody, HeaderRow, Table, TableRow, TitleCol } from '../../modal/ModalCheckList'
import { ButtonRow, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { fetchApp } from './apps.api'
import { IApp } from './apps.types'
import { APIResource } from '../types'
import { TrophyIcon } from '../../../components/icons/TrophyIcon'

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
  const { data, status, isLoading } = useQuery(['app', appUid], () =>
    fetchApp(appUid),
  )
  let meta = data?.meta
  if (status === 'loading') return <div>Loading...</div>
  if (meta.challenges.length === 0) return <div>No challenges yet.</div>

  return (
    <ModalScroll>
      <Table>
        <tbody>
          <HeaderRow>
            <CheckCol></CheckCol>
          </HeaderRow>
          {meta!.challenges.map((s: any, i: number) => (
            <TableRow
              isSelected={selected === s.id}
              key={i}
              onClick={() => onSelect(s.id)}
            >
              <TitleCol>
                <ColBody>
                  <TrophyIcon height={14} />
                  {s.name}
                </ColBody>
              </TitleCol>
              <StyledCheckCol>
                <CheckedColBody>
                  {selected === s.id && <CircleCheckIcon height={16} />}
                </CheckedColBody>
              </StyledCheckCol>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </ModalScroll>
  )
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  @media(min-width: ${breakPoints.small}px) {
    min-width: 300px;
    width: auto;
  }
`

export const assignToChallengeRequest = ({link, appId, challengeId}: {link: string, appId: string, challengeId: string}) => {
  const body = {
    app_id: appId,
    id: challengeId,
  }
  let res: any = fetch(link, {
      ...getApiRequestOpts('POST'),
      body: JSON.stringify(body),
    }).then(checkStatus).then(res => res.json())
  return res
}

const ChallengeAppForm = ({
  resource,
  app,
  setShowModal,
  onSuccess,
}: {
  resource: APIResource
  app: IApp
  setShowModal: (show: boolean) => void
  onSuccess: (res: any) => void
}) => {
  const [selectedId, setSelectedId] = useState<string>()

  const mutation = useMutation({
    mutationFn: assignToChallengeRequest,
    onSuccess: (res: any) => {
      onSuccess && onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res)
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const handleSelect = (f: string) => {
    if (f === selectedId) {
      setSelectedId(undefined)
    } else {
      setSelectedId(f)
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (selectedId) {
      mutation.mutateAsync({link: app.links.assign_app, appId: app.id, challengeId: selectedId})
    }
  }
  return (
    <StyledForm onSubmit={handleSubmit}>
      <ChallengesList appUid={app.uid} selected={selectedId} onSelect={handleSelect} />
      <ButtonRow>
        {mutation.isLoading && <Loader height={14} />}
        <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
        <ButtonSolidBlue type="submit" disabled={!selectedId || mutation.isLoading}>
          Assign
        </ButtonSolidBlue>
      </ButtonRow>
    </StyledForm>
  )
}

export function useAttachToChallengeModal<T extends { id: string | number }>({
  resource,
  selected,
  onSuccess,
}: {
  resource: APIResource
  selected: IApp
  onSuccess: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <Modal
      data-testid={`modal-${resource}-copytospace`}
      headerText={`Assign to challenge: `}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ChallengeAppForm
        resource={resource}
        app={selected}
        setShowModal={setShowModal}
        onSuccess={onSuccess}
      />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
