import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { itemsCountString, pluralize } from '../../../../utils/formatting'
import { lockFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'

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
  setNumberOfFilesToLock: (n: number) => void
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
        setNumberOfFilesToLock(res.length)
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

export const useLockFileModal = ({
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
  const [numberOfFilesToLock, setNumberOfFilesToLock] = useState<number>()

  const mutation = useMutation({
    // mutationKey: ['lock-files'],
    mutationFn: (ids: string[]) => lockFilesRequest(ids),
    onError: () => {
      toast.error(`Error: Locking ${numberOfFilesToLock} ${pluralize('file', numberOfFilesToLock ?? 1)} or ${pluralize('folder', numberOfFilesToLock ?? 1)}.`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['files'])
      queryClient.invalidateQueries(['counters'])
      setShowModal(false)
      toast.success(`Locked ${numberOfFilesToLock} ${pluralize('file', numberOfFilesToLock ?? 1)} or ${pluralize('folder', numberOfFilesToLock ?? 1)}.`)
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
          {mutation.isLoading && <Loader />}
          <Button
            onClick={() => setShowModal(false)}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <ButtonSolidRed onClick={handleSubmit} disabled={mutation.isLoading}>
            Lock
          </ButtonSolidRed>
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
