import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { Loader } from '../../../components/Loader'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { useModal } from '../../modal/useModal'
import { itemsCountString, pluralize } from '../../../utils/formatting'
import { lockFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'
import { DownloadListResponse } from '../../home/types'
import { Button } from '../../../components/Button'

const StyledPath = styled.div`
  min-width: 150px;
`

const LockFiles = ({
  selected,
  scope,
  setNumberOfFilesToLock,
}: {
  selected: IFile[]
  scope: string
  setNumberOfFilesToLock: (n: DownloadListResponse[]) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['download_list', selected],
    queryFn: () =>
      fetchFilesDownloadList(
        selected.map(s => s.id),
        scope,
      ).catch(() => toast.error('Error: Fetching download list')),
  })

  useEffect(() => {
      if(data) setNumberOfFilesToLock(data)
  }, [data])

  if (isLoading) return <div>Loading...</div>
  return (
    <ResourceTable
      rows={data!.map(s => ({
        name: (
          <StyledName data-turbolinks="false" href={s.viewURL} target="_blank">
            <VerticalCenter>{s.type === 'file' ? <FileIcon /> : <FolderIcon />}</VerticalCenter>
            {s.name}
          </StyledName>
        ),
        path: <StyledPath>{s.fsPath}</StyledPath>,
      }))}
    />
  )
}

export const useLockFileModal = ({ selected, onSuccess, scope }: { selected: IFile[]; onSuccess: () => void; scope: string }) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [numberOfFilesToLock, setNumberOfFilesToLock] = useState<number>()

  const mutation = useMutation({
    // mutationKey: ['lock-files'],
    mutationFn: (ids: string[]) => lockFilesRequest(ids),
    onError: () => {
      toast.error(
        `Error: Locking ${numberOfFilesToLock} ${pluralize('file', numberOfFilesToLock ?? 1)} or ${pluralize(
          'folder',
          numberOfFilesToLock ?? 1,
        )}.`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
      setShowModal(false)
      toast.success(
        `Locked ${numberOfFilesToLock} ${pluralize('file', numberOfFilesToLock ?? 1)} or ${pluralize(
          'folder',
          numberOfFilesToLock ?? 1,
        )}.`,
      )
      onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <Modal
      id="modal-files-lock"
      data-testid="modal-files-lock"
      headerText={`Lock ${numberOfFilesToLock ? itemsCountString('item', numberOfFilesToLock) : '...'}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSubmit} disabled={mutation.isPending}>
            Lock
          </Button>
        </>
      }
    >
      <LockFiles selected={memoSelected} scope={scope} setNumberOfFilesToLock={setNumberOfFilesToLock} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
