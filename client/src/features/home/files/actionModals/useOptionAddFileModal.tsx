import React from 'react'
import styled from 'styled-components'
import { ButtonSolidBlue } from '../../../../components/Button'
import { colors } from '../../../../styles/theme'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'

const Row = styled.div`
  display: flex;
  gap: 16px;
`
const MBody = styled.div`
  padding: 0 12px;
  padding-bottom: 12px;
`

const Spacer = styled.div`
  width: 2px;
  flex: 1 0 auto;
  background: ${colors.backgroundLightGray};
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
}: any) => {
  const { isShown, setShowModal } = useModal()
  const modalComp = (
    <Modal
      data-testid="choose-add-file-option-modal"
      headerText="How would you like to add files?"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <MBody>
        <Row>
          <Option>
            <div>
              <h3>Copy data already on PrecisionFDA</h3>
              <div>This includes files, apps, workflows, and jobs</div>
            </div>
            <div>
              <ButtonSolidBlue
                onClick={() => {
                  setShowModal(false)
                  setShowCopyFilesModal(true)
                }}
              >
                Copy Files
              </ButtonSolidBlue>
            </div>
          </Option>
          <Spacer />
          <Option>
            <div>
              <h3>Upload new files</h3>
              <div>Only files can be uploaded from your computer.</div>
              <div>
                Apps, workflows, and jobs cannot be uploaded. These resources
                must be created in PrecisionFDA and copied into a space.
              </div>
            </div>
            <div>
              <ButtonSolidBlue
                onClick={() => {
                  setShowModal(false)
                  setShowFileUploadModal(true)
                }}
              >
                Upload Files
              </ButtonSolidBlue>
            </div>
          </Option>
        </Row>
      </MBody>
    </Modal>
  )

  return {
    modalComp,
    setShowModal,
  }
}
