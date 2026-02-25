import React from 'react'
import styled from 'styled-components'
import { useModal } from '../../modal/useModal'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Button } from '../../../components/Button'
import { CopyIcon } from '../../../components/icons/CopyIcon'
import { UploadIcon } from '../../../components/icons/UploadIcon'
import type { FileUploadModalOpenOptions } from './useFileUploadModal/FileUploadModalProvider'

const ModalBody = styled.div`
  padding: 32px;
`

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
`

const OptionCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  cursor: pointer;
  padding: 21px;
  border: 2px solid var(--c-layout-border);
  border-radius: 12px;
  background: var(--background);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-link);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--base-opacity-06);
  }
`

const OptionContent = styled.div`
  flex: 1;
`

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`

const OptionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-700);
  margin: 0;
  line-height: 1.3;
`

const OptionDescription = styled.p`
  font-size: 14px;
  color: var(--c-text-500);
  margin: 0;
  line-height: 1.5;
`

const OptionActions = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;

  svg {
    width: 24px;
    height: 24px;
    color: var(--primary-600);
  }
`

interface UseOptionAddFileModalProps {
  openFileUploadModal: (options?: FileUploadModalOpenOptions) => void
  setShowCopyFilesModal: (show: boolean) => void
}

export const useOptionAddFileModal = ({ openFileUploadModal, setShowCopyFilesModal }: UseOptionAddFileModalProps) => {
  const { isShown, setShowModal } = useModal()

  const handleCopyFiles = () => {
    setShowModal(false)
    setShowCopyFilesModal(true)
  }

  const handleUploadFiles = () => {
    setShowModal(false)
    openFileUploadModal()
  }

  const modalComp = (
    <ModalNext
      id="choose-add-file-option-modal"
      data-testid="choose-add-file-option-modal"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
      <ModalHeaderTop disableClose={false} headerText="Add Files to Space" hide={() => setShowModal(false)} />

      <ModalBody>
        <OptionsContainer>
          <OptionCard onClick={handleCopyFiles}>
            <OptionContent>
              <OptionHeader>
                <IconWrapper>
                  <CopyIcon />
                </IconWrapper>
                <OptionTitle>Copy Existing Files</OptionTitle>
              </OptionHeader>
              <OptionDescription>Select and copy files that are already available in PrecisionFDA</OptionDescription>
            </OptionContent>
            <OptionActions>
              <Button data-variant="primary">Copy Files</Button>
            </OptionActions>
          </OptionCard>

          <OptionCard onClick={handleUploadFiles}>
            <OptionContent>
              <OptionHeader>
                <IconWrapper>
                  <UploadIcon />
                </IconWrapper>
                <OptionTitle>Upload New Files</OptionTitle>
              </OptionHeader>
              <OptionDescription>Upload files directly from your computer to this space</OptionDescription>
            </OptionContent>
            <OptionActions>
              <Button data-variant="primary">Upload Files</Button>
            </OptionActions>
          </OptionCard>
        </OptionsContainer>
      </ModalBody>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
  }
}
