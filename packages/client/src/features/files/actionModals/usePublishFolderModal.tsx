import React, { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button } from '../../../components/Button'
import { FileIcon } from '../../../components/icons/FileIcon'
import { Loader } from '../../../components/Loader'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../components/ResourceTable'
import { Modal } from '../../modal'
import { useModal } from '../../modal/useModal'
import { HomeScope } from '../../home/types'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'

const PublishFolder = ({
  selectedFiles,
  scope,
}: {
  selectedFiles: IFile[]
  scope: HomeScope
}) => {
  const {
    data = [],
    isLoading,
  } = useQuery({
    queryKey: ['download_list', selectedFiles],
    queryFn: () =>
      fetchFilesDownloadList(
        selectedFiles.map(s => s.id),
        scope,
      ).catch(() => toast.error('Error: Fetching download list')),
  })
  if (isLoading) return <div>Loading...</div>

  return (
    <ResourceTable
      rows={data?.map(s => {
        return {
          name: (
            <StyledName data-turbolinks="false" href={s.viewURL} target="_blank">
              <VerticalCenter>
                <FileIcon />
              </VerticalCenter>
              {s.name}
            </StyledName>
          ),
          path: <div>{s.fsPath}</div>,
        }
      })}
    />
  )
}

export const usePublishFolderModal = (
  selectedFiles: IFile[],
  resetSelected: () => void,
  scope: HomeScope,
) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selectedFiles, [isShown])
  const mutation = useMutation({
    mutationKey: ['publish-files'],
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['files'],
      })
      resetSelected()
      setShowModal(false)
      toast.success('File successfully published')
    },
    onError: () => {
      toast.error('Error: Publishing file')
    },
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = isShown && (
    <Modal
      data-testid="modal-publish-folder"
      headerText="Publish folder"
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          {mutation.isPending && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isPending}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={mutation.isPending}>
            Publish
          </Button>
        </>
      }
    >
      <PublishFolder selectedFiles={momoSelected} scope={scope} />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
