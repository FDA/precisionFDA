import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { AxiosError } from 'axios'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { CircleCheckIcon } from '../../../components/icons/CircleCheckIcon'
import { Loader } from '../../../components/Loader'
import { breakPoints } from '../../../styles/theme'
import { displayPayloadMessage } from '../../../utils/api'
import { Modal } from '../../modal'
import { CheckCol, Col, ColBody, HeaderRow, Table, TableRow, TitleCol } from '../../modal/ModalCheckList'
import { ButtonRow, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { fetchEditableSpacesList } from '../../spaces/spaces.api'
import { APIResource } from '../types'
import { ProtectedIcon } from '../../spaces/ProtectedIcon'

const SpacesList = ({
  selected,
  spaceId,
  onSelect,
}: {
  selected?: string
  spaceId?: string
  onSelect: (scope: string) => void
}) => {
  const {
    data = [],
    status,
    refetch,
  } = useQuery(['editable_spaces_list'], fetchEditableSpacesList, {
    onError: () => {
      toast.error('Error: Fetching editable spaces.')
    },
  })

  const spacesList = data.filter(space => !space.scope.endsWith(`-${spaceId}`))

  if (status === 'loading') {
    return (
      <div>Loading...</div>
    )
  }
  if (spacesList.length === 0) {
    return (
      <div>You have no spaces.</div>
    )
  }

  return (
    <ModalScroll>
      <Table>
        <tbody>
          <HeaderRow>
            <TitleCol/>
            <TitleCol>Title</TitleCol>
            <Col>Scope</Col>
            <CheckCol/>
          </HeaderRow>
          {spacesList.map((s) => (
            <TableRow
              isSelected={selected === s.scope}
              key={s.scope}
              onClick={() => onSelect(s.scope)}
            >
              <Col>{s.protected && <ProtectedIcon/> }</Col>
              <TitleCol>
                <ColBody>

                  {s.title}
                </ColBody>
              </TitleCol>
              <Col>
                <ColBody>{s.scope}</ColBody>
              </Col>
              <CheckCol>
                <ColBody>
                  {selected === s.scope && <CircleCheckIcon height={16} />}
                </ColBody>
              </CheckCol>
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
  spaceId?: string
  setShowModal: (show: boolean) => void
  updateFunction: (space: string, ids: string[]) => Promise<any>
  onSuccess: (res: any) => void
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>()

  const mutation = useMutation({
    mutationKey: ['copy-to-space', resource],
    mutationFn: (space: string) => updateFunction(space, selected),
    onSuccess: (res: any) => {
      if (onSuccess) onSuccess(res)
      setShowModal(false)
      displayPayloadMessage(res)
    },
    onError: (e: AxiosError) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toast.error(`${error?.type}: ${error?.message}`)
        return

      }
      toast.error(error.message)
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
      mutation.mutateAsync(selectedTarget)
    }
  }
  return (
    <StyledForm onSubmit={handleSubmit}>
      <SpacesList selected={selectedTarget} spaceId={spaceId} onSelect={handleSelect} />
      <ButtonRow>
        {mutation.isLoading && <Loader height={14} />}
        <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
        <ButtonSolidBlue type="submit" disabled={!selectedTarget || mutation.isLoading}>
          Copy
        </ButtonSolidBlue>
      </ButtonRow>
    </StyledForm>
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
  spaceId?: string
  updateFunction: (space: string, ids: string[]) => Promise<any>
  onSuccess: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <Modal
      data-testid={`modal-${resource}-copytospace`}
      headerText={`Copy to space: ${momoSelected.length} item${momoSelected.length > 1 ? 's' : ''}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <CopyToSpaceForm
        updateFunction={updateFunction}
        resource={resource}
        selected={selected.map(s => s.id.toString())}
        spaceId={spaceId}
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
