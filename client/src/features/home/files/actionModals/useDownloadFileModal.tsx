/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/Button'
import { DownloadIcon } from '../../../../components/icons/DownloadIcon'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { VerticalCenter } from '../../../../components/Page/styles'
import {
  ResourceTable,
  StyledAction,
  StyledNameWithoutLink,
} from '../../../../components/ResourceTable'
import { useModal } from '../../../modal/useModal'
import { itemsCountString } from '../../../../utils/formatting'
import { IFile } from '../files.types'
import { ModalHeaderTop, ModalNext } from '../../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../../modal/styles'

const StyledResourceTable = styled(ResourceTable)`
  padding-left: 12px;
`

export const useDownloadFileModal = (selectedFiles: IFile[]) => {
  const { isShown, setShowModal } = useModal()
  const handleDownloadClick = (item: IFile) => {
    if (item.links.download) {
      const win = window.open(item.links.download, '_blank')
      win?.focus()
    }
  }

  const momoSelected = useMemo(() => selectedFiles, [isShown])

  const modalComp = isShown && (
    <ModalNext
      data-testid="modal-files-download"
      headerText={`Download ${itemsCountString('file', momoSelected.length)}?`}
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        headerText={`Download ${itemsCountString(
          'file',
          momoSelected.length,
        )}?`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledResourceTable
          rows={momoSelected.map((s, i) => ({
            name: (
              <StyledNameWithoutLink key={`${i}-name`}>
                <VerticalCenter>
                  <FileIcon />
                </VerticalCenter>
                {s.name}
              </StyledNameWithoutLink>
            ),
            action: (
              <StyledAction
                key={`${i}-action`}
                onClick={() => handleDownloadClick(s)}
              >
                <DownloadIcon />
                Download
              </StyledAction>
            ),
          }))}
        />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
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
