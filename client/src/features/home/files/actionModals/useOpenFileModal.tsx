import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/Button';
import { DownloadIcon } from '../../../../components/icons/DownloadIcon';
import { FileIcon } from '../../../../components/icons/FileIcon';
import { VerticalCenter } from '../../../../components/Page/styles';
import { ResourceTable, StyledAction, StyledName, StyledTD } from '../../../../components/ResourceTable';
import { Modal } from '../../../modal';
import { ModalScroll } from '../../../modal/styles';
import { useModal } from '../../../modal/useModal';
import { IFile } from '../files.types';


const StyledResourceTable = styled(ResourceTable)`
  padding: 8px;
  min-width: 400px;
  ${StyledAction} {
    margin-left: auto;
  }
`

export const useOpenFileModal = (selectedFiles: IFile[]) => {
  const { isShown, setShowModal } = useModal()
  const handleOpenClick = (item: IFile) => {
    if (item.links.download) {
      const win = window.open(`${item.links.download}?inline=true`, '_blank')
      win?.focus()
    }
  }

  const momoSelected = useMemo(() => selectedFiles, [isShown])
  const modalComp = (
    <Modal
      data-testid="modal-files-organize"
      headerText={`Open ${momoSelected.length} items(s)`}
      isShown={isShown}
      hide={() => setShowModal(false)}
      footer={<Button onClick={() => setShowModal(false)}>Cancel</Button>}
    >
      <ModalScroll>
        <StyledResourceTable
          rows={momoSelected.map(s => {
            return {
              name: (
                <StyledName href={`/home/files/${s.uid}`} target="_blank">
                  <VerticalCenter>
                    <FileIcon />
                  </VerticalCenter>
                  {s.name}
                </StyledName>
              ),
              action: (
                <StyledAction onClick={() => handleOpenClick(s)}>
                  <VerticalCenter>
                    <DownloadIcon />
                  </VerticalCenter>
                  Open
                </StyledAction>
              ),
            }
          })}
        />
      </ModalScroll>
    </Modal>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
