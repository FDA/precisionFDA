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
import { DownloadListResponse } from '../../types'
import { ModalScroll } from '../../../modal/styles'

const StyledPath = styled.div`
  min-width: 150px;
`

const DeleteFiles = ({
  selected,
  scope,
  setNodesToBeDeleted,
}: {
  selected: IFile[]
  scope: string
  setNodesToBeDeleted: (nodes: DownloadListResponse[]) => void
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
        setNodesToBeDeleted(res)
      },
      onError: () => {
        toast.error('Error: Fetching download list.')
      },
    },
  )
  if (status === 'loading') return <div>Loading...</div>
  return (
    <div>
      {data && (
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
      )}
    </div>
  )
}

const getPluralizedTerm = (itemCount: number, itemName: string): string => {
  if (itemCount === 1) {
    return `${itemCount.toString()} ${itemName}`
  }
  return `${itemCount.toString()} ${itemName}s`
}

const getMessage = (nodes?: DownloadListResponse[]) => {
  let filesCount = 0
  let foldersCount = 0

  nodes?.forEach(node => {
    if (node.type === 'file') {
      filesCount += 1
    } else {
      foldersCount += 1
    }
  })

  if (foldersCount > 0 && filesCount === 0) {
    return `${getPluralizedTerm(foldersCount, 'folder')}`
  }
  if (filesCount > 0 && foldersCount === 0) {
    return `${getPluralizedTerm(filesCount, 'file')}`
  }
  return `${getPluralizedTerm(filesCount, 'file')} and `
    + `${getPluralizedTerm(foldersCount, 'folder')}`
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
  const [nodesToBeDeleted, setNodesToBeDeleted] = useState<DownloadListResponse[]>()

  const mutation = useMutation({
    mutationKey: ['delete-files'],
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onError: (e: AxiosError) => {
      const error = e?.response?.data?.error
      if(error?.message) {
        toast.error(`${error?.type}: ${error?.message}`)
        return
      }
      toast.error(`Deleting of ${getMessage(nodesToBeDeleted)} has failed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['files'])
      // TODO counters are only for My Home, spaces have counters in request for space
      queryClient.invalidateQueries(['counters'])
      setShowModal(false)
      toast.success(`Deleting of ${getMessage(nodesToBeDeleted)} has been started`)
      onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <Modal
      id="modal-files-delete"
      data-testid="modal-files-delete"
      headerText={`Delete ${nodesToBeDeleted ? itemsCountString('item', nodesToBeDeleted.length) : '...'}`}
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
      <ModalScroll>
        <DeleteFiles selected={memoSelected} scope={scope} setNodesToBeDeleted={setNodesToBeDeleted}/>
      </ModalScroll>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
