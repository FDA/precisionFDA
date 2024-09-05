import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../components/ResourceTable'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { DownloadListResponse } from '../../home/types'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'
import { getMessage } from './modal-utils'

const StyledResourceTable = styled(ResourceTable)`
  padding: 12px;
`
const StyledLoader = styled.div`
  padding: 12px;
`
const StyledPath = styled.div`
  min-width: 150px;
`

const DeleteFiles = ({
  selected,
  setNodesToBeDeleted,
}: {
  selected: IFile[]
  setNodesToBeDeleted: (nodes: DownloadListResponse[]) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['download_list', selected],
    queryFn: async () => {
      // Group files by scope name
      const filesByScopes = new Map<string, IFile[]>()
      selected.forEach(file => {
        if (!filesByScopes.has(file.scope)) {
          filesByScopes.set(file.scope, [])
        }
        const files = filesByScopes.get(file.scope)
        if (files) {
          files.push(file)
        }
      })

      const promises: Promise<DownloadListResponse[]>[] = []
      filesByScopes.forEach((files, scope) => {
        promises.push(fetchFilesDownloadList(
          files.map(s => s.id),
          'delete',
          scope,
        ))
      })

      return Promise.all(promises).then(fileArrays => Promise.resolve(fileArrays.flat()))
    },
  })

  useEffect(() => {
    if(data) setNodesToBeDeleted(data)
  }, [data])
  if (isLoading) return <StyledLoader>Loading...</StyledLoader>
  return (
    data ? (
      <StyledResourceTable
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
    ) : <div />
  )
}

export const useDeleteFileModal = ({
  selected,
  onSuccess,
}: {
  selected: IFile[]
  onSuccess: () => void
}) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [nodesToBeDeleted, setNodesToBeDeleted] = useState<DownloadListResponse[]>([])

  const mutation = useMutation({
    mutationKey: ['delete-files'],
    mutationFn: (ids: number[]) => deleteFilesRequest(ids),
    onError: (e: AxiosError) => {
      const error = e?.response?.data?.error
      if(error?.message) {
        toast.error(`${error?.type}: ${error?.message}`)
        return
      }
      toast.error(`Deleting of ${getMessage(nodesToBeDeleted)} has failed`)
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
      toast.success(`Deleting of ${getMessage(nodesToBeDeleted)} has been started`)
      onSuccess()
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(nodesToBeDeleted.map(s => s.id))
  }

  const modalComp = (
    <ModalNext
      id="modal-files-delete"
      data-test-id="modal-files-delete"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Delete ${nodesToBeDeleted ? itemsCountString('item', nodesToBeDeleted.length) : '...'}`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <DeleteFiles selected={memoSelected} setNodesToBeDeleted={setNodesToBeDeleted}/>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button
            onClick={() => setShowModal(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button data-variant="warning" onClick={handleSubmit} disabled={!nodesToBeDeleted.length || mutation.isPending}>
            Delete
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
