import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { Loader } from '../../../components/Loader'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../components/ResourceTable'
import { itemsCountString, pluralize } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { DownloadListResponse, ServerScope } from '../../home/types'
import { fetchFilesListLockingRequest, LockUnlockActionType, lockUnlockFilesRequest } from '../files.api'
import { IFile } from '../files.types'
import { Button } from '../../../components/Button'

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
  files,
  statusText,
}: {
  files: DownloadListResponse[] | undefined,
  statusText: string | null,
}) => {

  if (statusText) return <Spacing>{statusText}</Spacing>
  if (!files?.length) return null
  return (
    <StyledResourceTable
      rows={files.map(s => ({
        name: (
          <StyledName data-turbolinks="false" href={s.viewURL} target="_blank">
            <VerticalCenter>{s.type === 'file' ? <FileIcon/> : <FolderIcon/>}</VerticalCenter>
            {s.name}
          </StyledName>
        ),
        path: <StyledPath>{s.fsPath}</StyledPath>,
      }))}
    />
  )
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred'

export const useLockUnlockFileModal = ({
  selected,
  onSuccess,
  scope,
  type,
}: {
  selected: IFile[]
  onSuccess?: () => void
  scope?: ServerScope
  type: LockUnlockActionType
}) => {
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [ isShown ])
  const [ numberOfFiles, setNumberOfFiles ] = useState<number>()
  const mutation = useMutation({
    mutationKey: [ 'lock-unlock-files', type ],
    mutationFn: (ids: number[]) => lockUnlockFilesRequest(ids, type),
    onError: () => {
      toast.error('Error: locking or unlocking')
    },
    onSuccess: () => {
      setShowModal(false)
      toast.success(
        `${ActionTypeName[type]}ing ${numberOfFiles} ${pluralize('file', numberOfFiles ?? 1)}`,
      )
      if (onSuccess) onSuccess()
    },
  })

  useEffect(() => {
    if (!isShown) mutation.reset()
  }, [isShown])

  const { data, status: downloadStatus, isLoading, error } = useQuery({
    queryKey: [ 'download_list', type, selected ],
    queryFn: () =>
      fetchFilesListLockingRequest(
        selected.map(s => s.id),
        scope,
        type,
      ).then((d) => {
        setNumberOfFiles(d.length)
        return d
      }),
    enabled: isShown,
    retry: (failureCount, retryError: AxiosError) => {
      if (retryError?.response?.status === 403) {
        return false
      }

      return failureCount > 3
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(memoSelected.map(s => s.id))
  }

  const getStatusText = () => {
    if (isLoading) {
      return 'Loading...'
    }

    if (downloadStatus === 'error') {
      return error?.response?.data?.error?.message ?? DEFAULT_ERROR_MESSAGE
    }

    if (mutation.status === 'error') {
      return DEFAULT_ERROR_MESSAGE
    }

    if (!data?.length) {
      return `Your selection does not include any files that can be ${type}ed.`
    }

    return null
  }

  const isSubmitDisabled = () => {
    return downloadStatus !== 'success' || mutation.status !== 'idle' || !data?.length
  }

  const modalComp = (
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
        <LockUnlockFiles files={data} statusText={getStatusText()}/>
      </ModalScroll>
      <Footer>
        {mutation.isPending && <Loader/>}
        <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button data-variant="primary" onClick={handleSubmit} disabled={isSubmitDisabled()}>
          {ActionTypeName[type]}
        </Button>
      </Footer>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
