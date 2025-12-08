import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Callout } from '../../../components/Callout'
import { Loader } from '../../../components/Loader'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScrollPadding } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { addSpacesToSpaceGroup } from '../../space-groups/api'
import { ISpaceV2 } from '../spaces.types'
import { ModalSpaceList } from './ModalSpaceList'

const ModalCallout = styled(Callout)`
  margin-top: 8px;
`

type TargetProps = { id: number; name: string }

export const useAddSpacesToSpaceGroupModal = ({ spaces }: { spaces: ISpaceV2[] }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [targetSpaceGroup, setTargetSpaceGroup] = useState<TargetProps>({ id: -1, name: '' })
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => spaces, [isShown])

  const spaceIds = useMemo(() => memoSelected.map(s => s.id), [memoSelected])
  const mutation = useMutation({ mutationFn: (id: number) => addSpacesToSpaceGroup(id, spaceIds) })

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync(targetSpaceGroup.id)
      toast.success(`Selected spaces were successfully added into ${targetSpaceGroup.name}`)
      queryClient.invalidateQueries({
        queryKey: ['space-group-list'],
      })
      queryClient.invalidateQueries({
        queryKey: ['space-groups', targetSpaceGroup.id],
      })
      if (searchParams.get('spaceGroupId') !== String(targetSpaceGroup.id)) {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set('spaceGroupId', targetSpaceGroup.id.toString())
        setSearchParams(newParams)
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(
          `Adding spaces to space group ${targetSpaceGroup.name} has failed due to: ${err?.response?.data?.error?.message}`,
        )
      } else {
        toast.error(`Adding spaces to space group ${targetSpaceGroup.name} has failed due to an unknown error`)
      }
    }
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="add-spaces-to-space-group"
      data-testid="add-spaces-to-space-group"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Adding ${itemsCountString('Space', memoSelected.length)} to ${targetSpaceGroup.name}`}
        hide={() => setShowModal(false)}
      />
      <ModalScrollPadding>
        <ModalSpaceList spaces={memoSelected} />
        <ModalCallout data-variant="primary">
          <p>Only Group, Review, or Government spaces can be added to a space group.</p>
        </ModalCallout>
      </ModalScrollPadding>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={spaceIds.length === 0 || mutation.isPending}>
            Add Spaces
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    openModal: (props: TargetProps) => {
      setTargetSpaceGroup(props)
      setShowModal(true)
    },
    isShown,
  }
}
