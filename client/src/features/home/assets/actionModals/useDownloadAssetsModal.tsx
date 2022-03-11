import React, { useMemo } from 'react'
import { Button } from '../../../../components/Button'
import { DownloadIcon } from '../../../../components/icons/DownloadIcon'
import { FileIcon } from '../../../../components/icons/FileIcon'
import { VerticalCenter } from '../../../../components/Page/styles'
import {
  ResourceTable,
  StyledAction,
  StyledName,
} from '../../../../components/ResourceTable'
import { Modal } from '../../../modal'
import { useModal } from '../../../modal/useModal'
import { IAsset } from '../assets.types'

export function useDownloadAssetsModal(selectedFiles: IAsset[]){
  const { isShown, setShowModal } = useModal()
  const handleDownloadClick = (item: IAsset) => {
    if (item.links.download) {
      const win = window.open(item.links.download, '_blank')
      win?.focus()
    }
  }

  const momoSelected = useMemo(() => selectedFiles, [isShown])

  const modalComp = (
    <Modal
      data-testid="modal-assets-download"
      headerText={`Download ${momoSelected.length} items(s)`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={<Button onClick={() => setShowModal(false)}>Cancel</Button>}
    >
      <ResourceTable
        rows={momoSelected.map((s, i) => {
          return {
            name: (
              <StyledName key={`${i}-name`} href={s.links.show} target="_blank">
                <VerticalCenter>
                  <FileIcon />
                </VerticalCenter>
                {s.name}
              </StyledName>
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
          }
        })}
      />
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
