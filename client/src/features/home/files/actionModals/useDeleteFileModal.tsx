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
import { DownloadListResponse, ResourceScope } from '../../types'
import { itemsCountString } from '../../utils'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'

const StyledPath = styled.div`
  min-width: 150px;
`

const DeleteFiles = ({
  data,
  scope,
}: {
  data: DownloadListResponse[]
  scope?: ResourceScope
}) => {
  return (
    <ResourceTable
      rows={data.map(s => {
        return {
          name: (
            <StyledName href={s.viewURL} target="_blank">
              <VerticalCenter>
                {s.type === 'file' ? <FileIcon /> : <FolderIcon /> }
              </VerticalCenter>
              {s.name}
            </StyledName>
          ),
          path: <StyledPath>{s.fsPath}</StyledPath>,
        }
      })}
    />
  )
}

export const useDeleteFileModal = ({ selected, onSuccess, scope } : {
  selected: IFile[],
  onSuccess: () => void,
  scope?: ResourceScope,
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])
  const mutation = useMutation({
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onError: () => {
      toast.error(`Error: Deleting ${selected.length} files or folders.`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries('files')
      queryClient.invalidateQueries('counters')
      onSuccess()
      setShowModal(false)
      toast.success(`Success: Deleted ${selected.length} files or folders.`)
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const { data = [], status, refetch } = useQuery(
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

  const itemsCount = (status === 'loading') ? momoSelected.length : data.length

  const modalComp = (
    <Modal
      data-testid="modal-files-delete"
      headerText={`Delete ${itemsCountString('item', itemsCount)}?`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      title="Modal window to select files for deletion"
      footer={
        <>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
          <ButtonSolidRed onClick={handleSubmit} disabled={mutation.isLoading}>
            Delete
          </ButtonSolidRed>
        </>
      }
    >
      {status === 'loading'
        ? <div>Loading...</div>
        : <DeleteFiles data={data} scope={scope} />
      }
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
