import React, { useState } from 'react'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import MonacoEditor from '../../../components/MonacoEditor/MonacoEditor'
import { useFetchFilesByUIDQuery } from '../../files/query/useFetchFilesByUIDQuery'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { IApp } from '../apps.types'
import { generateCopyUrl } from './utils'
import { toastSuccess } from '../../../components/NotificationCenter/ToastHelper'

const StyledButtonRow = styled(ButtonRow)`
  justify-content: space-between;
  flex: 1 0 auto;
`

export const useExportInputsModal = ({ showCopyButton, app }: { showCopyButton: boolean; app: IApp }) => {
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

  const handleCopy = (copyType: 'app' | 'appSeries') => {
    if (displayData === '') {
      return
    }

    const url = generateCopyUrl(displayData, window.location.href, app, copyType)

    toastSuccess('The link has been copied into your clipboard')
    navigator.clipboard.writeText(url)
  }

  const modalComp = (
    <ModalNext
      id="modal-files-add-folder"
      data-testid="modal-files-add-folder"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText="Export Input Values" hide={() => setShowModal(false)} />
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
          {showCopyButton ? (
            <ButtonRow>
              <Button
                disabled={isFetching || (areFiles && !areAllFilePublic)}
                type="button"
                onClick={() => handleCopy('app')}
                data-tooltip-id="selected-private-file-error"
                data-tooltip-content="One or more files are private. Make sure to make those files public to share."
              >
                Copy link for Current App
              </Button>
              <Button
                disabled={isFetching || (areFiles && !areAllFilePublic)}
                type="button"
                onClick={() => handleCopy('appSeries')}
                data-tooltip-id="selected-private-file-error"
                data-tooltip-content="One or more files are private. Make sure to make those files public to share."
              >
                Copy link for Latest App
              </Button>
              {areFiles && !areAllFilePublic && <Tooltip id="selected-private-file-error" />}
            </ButtonRow>
          ) : (
            <div />
          )}
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
