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
import { useModal } from '../../../modal/useModal'
import { itemsCountString, pluralize } from '../../../../utils/formatting'
import { LockUnlockActionType, lockUnlockFilesRequest, fetchFilesDownloadList, fetchFilesListLockingRequest } from '../files.api'
import { IFile } from '../files.types'
import { Footer, ModalScroll } from '../../../modal/styles'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'

const StyledResourceTable = styled(ResourceTable)`
  padding-left: 12px;
`
const Spacing = styled.div`
  padding: 12px;
`

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
  type: LockUnlockActionType
  setNumberOfFiles: (n: number) => void
}) => {
  const { data, status } = useQuery({
    queryKey: ['download_list', type, selected],
    queryFn: () =>
      fetchFilesListLockingRequest(
        selected.map(s => s.id),
        scope,
        type,
      ),
    keepPreviousData: false,
    onSuccess: res => {
      setNumberOfFiles(res.length)
    },
    onError: () => {
      toast.error('Error: Fetching download list.')
    },
  })
  if (status === 'loading') return <Spacing>Loading...</Spacing>
  if (!data?.length) return <Spacing>{`You have selected items that cannot be ${type}ed.`}</Spacing>
  return (
    <StyledResourceTable
      rows={data.map(s => ({
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

export const useLockUnlockFileModal = ({
  selected,
  onSuccess,
  scope,
  type,
}: {
  selected: IFile[]
  onSuccess?: () => void
  scope?: string
  spaceId?: string
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
      toast.success(
        `${ActionTypeName[type]}ed ${numberOfFiles} ${pluralize('file', numberOfFiles ?? 1)} or ${pluralize(
          'folder',
          numberOfFiles ?? 1,
        )}.`,
      )
      if (onSuccess) onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <ModalNext
      id="modal-files-lock-unlock"
      data-testid="modal-files-lock-unlock"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText={`${ActionTypeName[type]} ${numberOfFiles ? itemsCountString('item', numberOfFiles) : '...'}`}
        hide={() => setShowModal(false)}
      />

      <ModalScroll>
        <LockUnlockFiles selected={memoSelected} type={type} scope={scope} setNumberOfFiles={setNumberOfFiles} />
      </ModalScroll>
      <Footer>
        {mutation.isLoading && <Loader />}
        <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>
          Cancel
        </Button>
        <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
          {ActionTypeName[type]}
        </ButtonSolidBlue>
      </Footer>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
