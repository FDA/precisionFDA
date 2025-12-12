import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { DownloadIcon } from '../../../components/icons/DownloadIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledAction, StyledName } from '../../../components/ResourceTable'
import { pluralize, sanitizeFileName } from '../../../utils/formatting'
import { DownloadListResponse } from '../../home/types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'
import { toastError } from '../../../components/NotificationCenter/ToastHelper'

const StyledResourceTable = styled(ResourceTable)`
  padding: 8px;
  min-width: 400px;
  ${StyledAction} {
    margin-left: auto;
  }
`

interface OpenFileListProps {
  selectedFiles: IFile[]
  onSelectedLengthChange: (length: number) => void
}

const OpenFileList: React.FC<OpenFileListProps> = ({ selectedFiles, onSelectedLengthChange }) => {
  const handleOpenClick = (item: DownloadListResponse) => {
    // TODO(PFDA-5831) - v2 endpoint
    const win = window.open(`/api/files/${item.uid}/${sanitizeFileName(item.name)}?inline=true`, '_blank')
    win?.focus()
  }

  const { data } = useQuery({
    queryKey: ['download_list', selectedFiles],
    queryFn: async () => {
      const fileIds = selectedFiles.map(file => file.id)

      return fetchFilesDownloadList(fileIds, 'open', selectedFiles[0].scope)
        .then(res => {
          onSelectedLengthChange(res.length)
          return res
        })
        .catch(error => {
          toastError('Failed to load file list')
          throw error
        })
    },
  })

  return (
    <>
      {data && (
        <StyledResourceTable
          rows={data.map(s => {
            return {
              name: (
                <StyledName data-turbolinks="false" onClick={() => handleOpenClick(s)}>
                  <VerticalCenter>
                    <FileIcon />
                  </VerticalCenter>
                  {s.name}
                </StyledName>
              ),
              path: <div>{s.fsPath}</div>,
              action: (
                <StyledAction data-variant="primary" onClick={() => handleOpenClick(s)}>
                  <VerticalCenter>
                    <DownloadIcon />
                  </VerticalCenter>
                  Open
                </StyledAction>
              ),
            }
          })}
        />
      )}
    </>
  )
}

export const useOpenFileModal = (selectedFiles: IFile[]) => {
  const { isShown, setShowModal } = useModal()
  const [seletedLength, setSelectedLength] = useState<number>(0)

  const modalComp = (
    <ModalNext
      id="modal-files-organize"
      data-testid="modal-files-organize"
      headerText={`Open ${seletedLength} ${pluralize('item', seletedLength)}`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop headerText={`Open ${seletedLength} ${pluralize('item', seletedLength)}`} hide={() => setShowModal(false)} />
      <ModalScroll>
        <OpenFileList selectedFiles={selectedFiles} onSelectedLengthChange={setSelectedLength} />
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
