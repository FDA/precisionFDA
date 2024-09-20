import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { CircleCheckIcon } from '../../components/icons/CircleCheckIcon'
import { breakPoints } from '../../styles/theme'
import { displayPayloadMessage } from '../../utils/api'
import { APIResource } from '../home/types'
import { CheckCol, Col, ColBody, HeaderRow, Table, TableRow, TitleCol } from '../modal/ModalCheckList'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { FdaRestrictedIcon } from '../spaces/FdaRestrictedIcon'
import { ProtectedIcon } from '../spaces/ProtectedIcon'
import { fetchEditableSpacesList } from '../spaces/spaces.api'
import { useConfirmModal } from '../files/actionModals/useConfirmModal'
import {
  APP_REVISION_CREATION_NOT_REQUESTED,
  APP_SERIES_CREATION_NOT_REQUESTED,
} from '../../constants'
import { CONFIRM_APP_REVISION, CONFIRM_APP_SERIES } from '../../constants/consts'

const SpacesList = ({
  selected,
  spaceId,
  onSelect,
}: {
  selected?: string
  spaceId?: string
  onSelect: (scope: string) => void
}) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['editable_spaces_list'],
    queryFn: fetchEditableSpacesList,
  })

  const spacesList = data.filter(space => !space.scope.endsWith(`-${spaceId}`))

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (spacesList.length === 0) {
    return <div>You have no spaces.</div>
  }

  return (
    <Table>
      <tbody>
        <HeaderRow>
          <TitleCol />
          <TitleCol>Title</TitleCol>
          <Col>Scope</Col>
          <CheckCol />
        </HeaderRow>
        {spacesList.map(s => (
          <TableRow $isSelected={selected === s.scope} key={s.scope} onClick={() => onSelect(s.scope)}>
            <Col>
              {s.protected && <ProtectedIcon />}
              {s.restricted_reviewer && <FdaRestrictedIcon />}
            </Col>
            <TitleCol>
              <ColBody>{s.title}</ColBody>
            </TitleCol>
            <Col>
              <ColBody>{s.scope}</ColBody>
            </Col>
            <CheckCol>
              <ColBody>{selected === s.scope && <CircleCheckIcon height={16} />}</ColBody>
            </CheckCol>
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
    width: auto;
  }
`

const CopyToSpaceForm = ({
  resource,
  selected,
  spaceId,
  updateFunction,
  setShowModal,
  onSuccess,
}: {
  resource: APIResource
  selected: string[]
  spaceId?: number
  setShowModal: (show: boolean) => void
  updateFunction: (space: string, ids: string[], properties?: Record<string, any>) => Promise<any>
  onSuccess: (res: any) => void
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>()
  let mutation
  const { modalComp: appRevisionConfirmModal, setShowModal: setShowAppRevisionConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_REVISION,
    async () => {
      setShowAppRevisionConfirmModal(false)
      await mutation.mutateAsync({ space: selectedTarget, properties: { createAppRevision: true }})
    },
  )

  const { modalComp: appSeriesConfirmModal, setShowModal: setShowAppSeriesConfirmModal } = useConfirmModal(
    'Confirm',
    CONFIRM_APP_SERIES,
    async () => {
      setShowAppSeriesConfirmModal(false)
      await mutation.mutateAsync({ space: selectedTarget, properties: { createAppSeries: true }})
    },
  )

  mutation = useMutation({
    mutationKey: ['copy-to-space', resource],
    mutationFn: ({ space, properties }: { space: string, properties?: Record<string, any> }) => updateFunction(space, selected, properties),
    onSuccess: (res: any) => {
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res)
    },
    onError: (err: AxiosError) => {
      const code = err.response?.data?.error?.code
      if (code === APP_SERIES_CREATION_NOT_REQUESTED) {
        setShowAppSeriesConfirmModal(true)
      } else if (code === APP_REVISION_CREATION_NOT_REQUESTED) {
        setShowAppRevisionConfirmModal(true)
      } else {
        const message = err.response?.data?.error?.message || err.message || 'Unknown error'
        toast.error(message)
      }
    },
  })

  const handleSelect = (f: string) => {
    if (f === selectedTarget) {
      setSelectedTarget(undefined)
    } else {
      setSelectedTarget(f)
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (selectedTarget) {
      mutation.mutateAsync({ space: selectedTarget })
    }
  }
  return (
    <>
      <ModalScroll>
        <StyledForm id="copy-to-space-form" onSubmit={handleSubmit}>
          <SpacesList selected={selectedTarget} spaceId={spaceId} onSelect={handleSelect} />
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader height={14} />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="copy-to-space-form" disabled={!selectedTarget || mutation.isPending}>
            Copy
          </Button>
        </ButtonRow>
      </Footer>
      {appSeriesConfirmModal}
      {appRevisionConfirmModal}
    </>
  )
}

export function useCopyToSpaceModal<T extends { id: string | number }>({
  resource,
  selected,
  spaceId,
  updateFunction,
  onSuccess,
}: {
  resource: APIResource
  selected: T[]
  spaceId?: number
  updateFunction: (space: string, ids: string[], properties?: Record<string, any>) => Promise<any>
  onSuccess: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <ModalNext
      id={`modal-${resource}-copytospace`}
      data-testid={`modal-${resource}-copytospace`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Copy to space: ${momoSelected.length} item${momoSelected.length > 1 ? 's' : ''}`}
        hide={() => setShowModal(false)}
      />
      <CopyToSpaceForm
        updateFunction={updateFunction}
        resource={resource}
        selected={selected.map(s => s.id.toString())}
        spaceId={spaceId}
        setShowModal={setShowModal}
        onSuccess={onSuccess}
      />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
