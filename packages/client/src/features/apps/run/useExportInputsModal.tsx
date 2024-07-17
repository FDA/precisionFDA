import React, { useState } from 'react'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'
import { useFetchFilesByUIDQuery } from '../../files/query/useFetchFilesByUIDQuery'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'

const StyledButtonRow = styled(ButtonRow)`
  justify-content: space-between;
  flex: 1 0 auto;
`

export const useExportInputsModal = ({ showCopyButton }: { showCopyButton: boolean }) => {
  const { isShown, setShowModal } = useModal()
  const [displayData, setDisplayData] = useState('')
  const [fileUids, setFileUids] = useState<string[]>([])

  const { isFetching, data: userListFiles } = useFetchFilesByUIDQuery(fileUids || [])
  // const areAllFilePublic = userListFiles?.every(f => f.scope === 'public')
  // Temporarily disabling public files check
  const areAllFilePublic = true
  const areFiles = userListFiles ? userListFiles?.length > 0 : false

  const openModal = async (data: unknown, fuids: string[]) => {
    setShowModal(true)
    setFileUids(fuids)
    setDisplayData(JSON.stringify(data))
  }

  const handleCopy = () => {
    const data = { inputs: JSON.parse(displayData) }
    const base64Encoded = btoa(JSON.stringify(data))
    const { href } = window.location

    if (displayData) {
      toast.success('The link has been copied into your clipboard')
      navigator.clipboard.writeText(`${href}#${base64Encoded}`)
    }
  }

  const modalComp = isShown && (
    <ModalNext
      id="modal-files-add-folder"
      data-testid="modal-files-add-folder"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText="Export Input Values"
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <MonacoEditor
          options={{
            minimap: {
              enabled: false,
            },
            padding: { top: 16 },
          }}
          formatDocument
          defaultLanguage="json"
          height="40vh"
          width="50vw"
          onChange={val => setDisplayData(val ?? '')}
          value={displayData}
        />
      </ModalScroll>
      <Footer>
        <StyledButtonRow>
          {showCopyButton ?
            <>
              <Button disabled={isFetching || (areFiles && !areAllFilePublic)} type="button" onClick={() => handleCopy()} data-tip data-for="selected-private-file-error">
                Copy link to clipboard
              </Button>
              {areFiles && !areAllFilePublic && (
                <ReactTooltip
                  id="selected-private-file-error"
                  data-id="selected-private-file-error"
                  place="top"
                  effect="solid"
                >
                  One or more files are private. Make sure to make those files public to share.
                </ReactTooltip>
              )}
            </>
          : <div />}
          <ButtonRow>
          <Button type="button" onClick={() => setShowModal(false)}>
            Close
          </Button>
          </ButtonRow>
        </StyledButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    openModal,
  }
}
