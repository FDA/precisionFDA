import React, { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { Button, ButtonSolidBlue } from '../../../../components/Button'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { Loader } from '../../../../components/Loader'
import { VerticalCenter } from '../../../../components/Page/styles'
import { ResourceTable, StyledName } from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { ResourceScope } from '../../types'
import { deleteFilesRequest, fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'

const PublishFolder = ({
  selectedFiles,
  scope,
}: {
  selectedFiles: IFile[]
  scope: ResourceScope
}) => {
  const {
    data = [],
    status,
    refetch,
  } = useQuery(['download_list', selectedFiles], () =>
    fetchFilesDownloadList(
      selectedFiles.map(s => s.id),
      scope,
    ), {
      onError: () => {toast.error('Error: Fetching download list.')},
    }
  )
  if (status === 'loading') return <div>Loading...</div>

  return (
    <ResourceTable
      rows={data.map(s => {
        return {
          name: (
            <StyledName href={s.viewURL} target="_blank">
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
  scope: ResourceScope,
) => {
  const queryClient = useQueryClient()
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selectedFiles, [isShown])
  const mutation = useMutation({
    mutationFn: (ids: string[]) => deleteFilesRequest(ids),
    onSuccess: () => {
      queryClient.invalidateQueries('files')
      resetSelected()
      setShowModal(false)
      toast.success('Success: Publishing file.')
    },
    onError: () => {
      toast.error('Error: Publishing file.')
    }
  })

  const handleSubmit = () => {
    mutation.mutateAsync(momoSelected.map(s => s.id))
  }

  const modalComp = (
    <Modal
      data-testid="modal-publish-folder"
      headerText={`Publish folder`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={
        <>
          {mutation.isLoading && <Loader />}
          <Button onClick={() => setShowModal(false)} disabled={mutation.isLoading}>Cancel</Button>
          <ButtonSolidBlue onClick={handleSubmit} disabled={mutation.isLoading}>
            Publish
          </ButtonSolidBlue>
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
