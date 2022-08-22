import React, { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidRed } from '../../../../components/Button'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { Loader } from '../../../../components/Loader'
import { VerticalCenter } from '../../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { itemsCountString } from '../../../../utils/formatting'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'
import { DownloadListResponse } from '../../types'

const StyledPath = styled.div`
  min-width: 150px;
`

const DeleteFiles = ({
  data,
}: {
  data: DownloadListResponse[]
}) => (
    <ResourceTable
      rows={data.map(s => ({
          name: (
            <StyledName href={s.viewURL} target="_blank">
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
  const momoSelected = useMemo(() => selected, [isShown])

  const {
    data = [],
    status,
  } = useQuery(
    ['download_list', selected],
    () =>
      fetchFilesDownloadList(
        selected.map(s => s.id),
        scope,
      ),
    {
      onError: () => {
        toast.error('Error: Fetching download list.')
      },
    },
  )

  const mutation = useMutation({
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onError: () => {
      toast.error(`Error: Deleting ${data.length} files or folders.`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries('files')
      // TODO counters are only for My Home, spaces have counters in request for space
      queryClient.invalidateQueries('counters')
      onSuccess()
      setShowModal(false)
      toast.success(`Success: Deleted ${data.length} files or folders.`)
    },
  })  

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <Modal
      data-testid="modal-files-delete"
      headerText={`Delete ${itemsCountString('item', data.length)}?`}
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
      {status === 'loading' ? (
        <div>Loading...</div>
      ) : (
        <DeleteFiles data={data} />
      )}
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
