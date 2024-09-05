import React from 'react'
import styled from 'styled-components'
import { useModal } from '../../modal/useModal'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { Button } from '../../../components/Button'

const Row = styled.div`
  display: flex;
  gap: 16px;
`
const MBody = styled.div`
  padding: 24px 24px;

  h3 {
    font-weight: bolder;
    margin-bottom: 1rem;
    font-size: 17px;
  }
  p {
    margin-bottom: 1rem;
  }
`

const Spacer = styled.div`
  width: 2px;
  flex: 1 0 auto;
  background: var(--c-layout-border);
`

const Option = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  justify-content: space-between;

  button {
    margin-top: 16px;
    justify-self: flex-end;
  }
`

export const useOptionAddFileModal = ({
  setShowFileUploadModal,
  setShowCopyFilesModal,
}: {
  setShowFileUploadModal(b: boolean): void,
  setShowCopyFilesModal(b: boolean): void
}) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = (
    <ModalNext
      id="choose-add-file-option-modal"
      data-testid="choose-add-file-option-modal"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="medium"
    >
            <ModalHeaderTop
        disableClose={false}
        headerText="How would you like to add files?"
        hide={() => setShowModal(false)}
      />
      <MBody>
        <Row>
          <Option>
            <div>
              <h3>Copy data already on PrecisionFDA</h3>
              <p>This includes files, apps, workflows, and jobs</p>
            </div>
            <div>
              <Button
                data-variant="primary"
                onClick={() => {
                  setShowModal(false)
                  setShowCopyFilesModal(true)
                }}
              >
                Copy Files
              </Button>
            </div>
          </Option>
          <Spacer />
          <Option>
            <div>
              <h3>Upload new files</h3>
              <p>Only files can be uploaded from your computer.</p>
              <p>
                Apps, workflows, and jobs cannot be uploaded. These resources
                must be created in PrecisionFDA and copied into a space.
              </p>
            </div>
            <div>
              <Button
                data-variant="primary"
                onClick={() => {
                  setShowModal(false)
                  setShowFileUploadModal(true)
                }}
              >
                Upload Files
              </Button>
            </div>
          </Option>
        </Row>
      </MBody>
    </ModalNext>
  )

  return {
    modalComp,
    setShowModal,
  }
}
