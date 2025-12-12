import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { VerticalCenter } from '../../../components/Page/styles'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { itemsCountString, pluralize } from '../../../utils/formatting'
import { getBasePath } from '../../home/utils'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { moveFilesRequest } from '../files.api'
import { IFile } from '../files.types'
import { ApiErrorResponse } from '../../home/types'
import { toastError, toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const StyledLink = styled(Link)`
  display: flex;
  gap: 8px;
  padding: 8px 24px;
`

type TargetProps = { id: number | null; name: string }

export const useDnDMoveFileModal = ({
  spaceId,
  selected,
  onSuccess,
  onCanceled,
}: {
  spaceId?: number
  selected: IFile[]
  onSuccess?: () => void
  onCanceled?: () => void
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const [targetNode, setTargetNode] = useState<TargetProps>({ id: null, name: 'root' })
  const memoSelected = useMemo(() => selected, [isShown])

  const mutation = useMutation({
    mutationKey: ['move-files'],
    mutationFn: (ids: number[]) => moveFilesRequest(ids, targetNode.id === 0 ? null : targetNode.id, spaceId),
    onError: (e: AxiosError<ApiErrorResponse>) => {
      const error = e?.response?.data?.error
      if (error?.message) {
        toastError(error?.message)
        return
      }
      toastError('Moving items has failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      // TODO counters are only for My Home, spaces have counters in request for space
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
      setShowModal(false)
      if (onSuccess) {
        onSuccess()
        toastSuccess(`Successfully moved ${memoSelected.length} ${pluralize('item', memoSelected.length)} to ${targetNode.name}`)
      }
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = (
    <ModalNext id="modal-files-move" data-test-id="modal-files-move" isShown={isShown} hide={() => setShowModal(false)}>
      <ModalHeaderTop
        disableClose={false}
        headerText={`Moving ${memoSelected ? itemsCountString('item', memoSelected.length) : '...'} to ${targetNode.name}`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        {memoSelected.map(s => {
          const link =
            s.type === 'Folder' ? `${getBasePath(spaceId)}/files?folder_id=${s.id}` : `${getBasePath(spaceId)}/files/${s.uid}`
          return (
            <StyledLink key={s.id} to={link} target="_blank">
              <VerticalCenter>{s.type === 'UserFile' ? <FileIcon /> : <FolderIcon />}</VerticalCenter>
              {s.name}
            </StyledLink>
          )
        })}
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button
            onClick={() => {
              if (onCanceled) onCanceled()
              setShowModal(false)
            }}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button data-variant="primary" onClick={handleSubmit} disabled={!memoSelected.length || mutation.isPending}>
            Move
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
    openModal: (props: TargetProps) => {
      setTargetNode(props)
      setShowModal(true)
    },
    isShown,
  }
}
