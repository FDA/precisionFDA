import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import styled from 'styled-components'
import { Button, ButtonSolidRed } from '../../../../components/Button'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { Loader } from '../../../../components/Loader'
import { VerticalCenter } from '../../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { itemsCountString, pluralize } from '../../../../utils/formatting'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'

const StyledPath = styled.div`
  min-width: 150px;
`

const DeleteFiles = ({
  selected,
  scope,
  setNumberOfFilesToDelete,
}: {
  selected: IFile[]
  scope: string
  setNumberOfFilesToDelete: (n: number) => void
}) => {
  const { data, status } = useQuery(
    ['download_list', selected],
    () =>
      fetchFilesDownloadList(
        selected.map(s => s.id),
        scope,
      ),
    {
      onSuccess: (res) => {
        setNumberOfFilesToDelete(res.length)
      },
      onError: () => {
        toast.error('Error: Fetching download list.')
      },
    },
  )
  if (status === 'loading') return <div>Loading...</div>
  return (
    <ResourceTable
      rows={data!.map(s => ({
        name: (
          <StyledName data-turbolinks="false" href={s.viewURL} target="_blank">
            <VerticalCenter>
              {s.type === 'file' ? <FileIcon /> : <FolderIcon />}
            </VerticalCenter>
            {s.name}
          </StyledName>
        ),
        path: <StyledPath>{s.fsPath}</StyledPath>,
      }))}
    />
  )
}

export const useDeleteFileModal = ({
  selected,
  onSuccess,
  scope,
}: {
  selected: IFile[]
  onSuccess: () => void
  scope: string
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [numberOfFilesToDelete, setNumberOfFilesToDelete] = useState<number>()

  const mutation = useMutation({
    mutationKey: ['delete-files'],
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onError: (e: AxiosError) => {
      const error = e?.response?.data?.error
      if(error?.message) {
        toast.error(`${error?.type}: ${error?.message}`)
        return
      }
      toast.error(`Error while Deleting ${numberOfFilesToDelete} ${pluralize('file', numberOfFilesToDelete ?? 1)} or ${pluralize('folder', numberOfFilesToDelete ?? 1)}.`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['files'])
      // TODO counters are only for My Home, spaces have counters in request for space
      queryClient.invalidateQueries(['counters'])
      setShowModal(false)
      toast.success(`${numberOfFilesToDelete} ${pluralize('file', numberOfFilesToDelete ?? 1)} or ${pluralize('folder', numberOfFilesToDelete ?? 1)} deleted.`)
      onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = (
    <Modal
      id="modal-files-delete"
      data-testid="modal-files-delete"
      headerText={`Delete ${numberOfFilesToDelete ? itemsCountString('item', numberOfFilesToDelete) : '...'}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          {mutation.isLoading && <Loader />}
          <Button
            onClick={() => setShowModal(false)}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <ButtonSolidRed onClick={handleSubmit} disabled={mutation.isLoading}>
            Delete
          </ButtonSolidRed>
        </>
      }
    >
      <DeleteFiles selected={memoSelected} scope={scope} setNumberOfFilesToDelete={setNumberOfFilesToDelete} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
