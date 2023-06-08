import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { FolderIcon } from '../../../../components/icons/FolderIcon'
import { Loader } from '../../../../components/Loader'
import { VerticalCenter } from '../../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { itemsCountString, pluralize } from '../../../../utils/formatting'
import { LockUnlockActionType, fetchFilesDownloadList, lockUnlockFilesRequest } from '../files.api'
import { IFile } from '../files.types'


const StyledPath = styled.div`
  min-width: 150px;
`

const ActionTypeName: Record<LockUnlockActionType, string> = {
  lock: 'Lock',
  unlock: 'Unlock',
}

const LockUnlockFiles = ({
  selected,
  scope,
  type,
  setNumberOfFiles,
}: {
  selected: IFile[]
  scope?: string
  type: LockUnlockActionType,
  setNumberOfFiles: (n: number) => void
}) => {
  const { data, status } = useQuery({
    queryKey: ['download_list', type, selected],
    queryFn: () => fetchFilesDownloadList(
      selected.map(s => s.id),
      scope,
    ),
    keepPreviousData: false,
    onSuccess: (res) => {
      setNumberOfFiles(res.length)
    },
    onError: () => {
      toast.error('Error: Fetching download list.')
    },
  })
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

export const useLockUnlockFileModal = ({
  selected,
  onSuccess,
  scope,
  type,
}: {
  selected: IFile[]
  onSuccess?: () => void
  scope?: string
  spaceId?: string,
  type: LockUnlockActionType
}) => {
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [numberOfFiles, setNumberOfFiles] = useState<number>()

  const mutation = useMutation({
    mutationKey: ['lock-unlock-files', type],
    mutationFn: (ids: string[]) => lockUnlockFilesRequest(ids, type),
    onError: () => {
      toast.error('Error: locking or unlocking')
    },
    onSuccess: () => {
      setShowModal(false)
      toast.success(`${ActionTypeName[type]}ed ${numberOfFiles} ${pluralize('file', numberOfFiles ?? 1)} or ${pluralize('folder', numberOfFiles ?? 1)}.`)
      if(onSuccess) onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = (
    <Modal
      id="modal-files-delete"
      data-testid="modal-files-delete"
      headerText={`${ActionTypeName[type]} ${numberOfFiles ? itemsCountString('item', numberOfFiles) : '...'}`}
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
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            {ActionTypeName[type]}
          </ButtonSolidBlue>
        </>
      }
    >
      <LockUnlockFiles selected={memoSelected} type={type} scope={scope} setNumberOfFiles={setNumberOfFiles} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
