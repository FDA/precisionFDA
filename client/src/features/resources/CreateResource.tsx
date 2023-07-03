import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../components/Button'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { Item, useUploadResource } from './useUploadResource'
import { Loader } from '../../components/Loader'

const FormModalHeader = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
`
const NoFiles = styled.div`
  padding: 12px 24px;
`
const List = styled.div`
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ResourceForm = ({
  pid,
  setShowModal,
}: {
  pid: string
  setShowModal: (show: boolean) => void
}) => {
  const queryClient = useQueryClient()
  const {
    isLoading,
    selectedFiles,
    removeItemByIndex,
    handleSubmit,
    handleNameChange,
    handleFileChange,
  } = useUploadResource({
    id: pid,
    onSuccess() {
      queryClient.invalidateQueries(['resources-list-portal'])
      setShowModal(false)
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeaderTop
        disableClose={false}
        hide={() => setShowModal(false)}
        headerText={
          <FormModalHeader>
            {isLoading ? 'Uploading' : 'Upload'} Resources
            {!isLoading &&
            <Button as="label">
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                />
              Choose Files
            </Button>
              }
          </FormModalHeader>
        }
      />

      <ModalScroll>
        {selectedFiles.length === 0 ? (
          <NoFiles>No files selected for uploading</NoFiles>
        ) : (
          <List>
            {selectedFiles.map((file, index) => (
              <Item
                disabled={isLoading}
                key={file.rid}
                index={index}
                file={file}
                handleNameChange={handleNameChange}
                removeItemByIndex={removeItemByIndex}
              />
            ))}
          </List>
        )}
      </ModalScroll>
      <Footer>
        {isLoading && <Loader />}
        <ButtonSolidBlue disabled={selectedFiles.length === 0 || isLoading} type="submit">
          Upload
        </ButtonSolidBlue>
      </Footer>
    </form>
  )
}

export const CreateResource = ({
  pid,
  onSuccess,
}: {
  pid: string
  onSuccess: () => void
}) => {
  const { isShown, setShowModal } = useModal()

  return (
    <div>
      <ButtonSolidBlue type="button" onClick={() => setShowModal(true)}>
        Upload Resources
      </ButtonSolidBlue>
      {isShown && (
        <ModalNext
          id="add-resource-to-space"
          data-testid="modal-add-resource"
          isShown={isShown}
          hide={() => setShowModal(false)}
        >
          <ResourceForm pid={pid} setShowModal={setShowModal} />
        </ModalNext>
      )}
    </div>
  )
}
