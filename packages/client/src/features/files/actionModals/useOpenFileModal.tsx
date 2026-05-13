import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { FileIcon } from '@/components/icons/FileIcon'
import { VerticalCenter } from '@/components/Page/styles'
import { ResourceTable, StyledAction, StyledName } from '@/components/ResourceTable'
import { pluralize, sanitizeFileName } from '@/utils/formatting'
import type { DownloadListResponse } from '../../home/types'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { fetchFilesDownloadList } from '../files.api'
import type { IFile } from '../files.types'
import { toastError } from '@/components/NotificationCenter/ToastHelper'
import { DownloadIcon } from '@/components/icons/DownloadIcon'

const StyledResourceTable: typeof ResourceTable = styled(ResourceTable)`
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

const OpenFileList: React.FC<OpenFileListProps> = ({
  selectedFiles,
  onSelectedLengthChange,
}: OpenFileListProps): React.ReactElement => {
  const handleOpenClick = (item: DownloadListResponse): void => {
    const win = window.open(`/api/v2/files/${item.uid}/${sanitizeFileName(item.name)}?inline=true`, '_blank')
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

export const useOpenFileModal = (
  selectedFiles: IFile[],
): { modalComp: React.ReactElement; setShowModal: (show: boolean) => void; isShown: boolean } => {
  const { isShown, setShowModal } = useModal()
  const [seletedLength, setSelectedLength] = useState<number>(0)

  const hideModal = (): void => {
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext
      id="modal-files-organize"
      data-testid="modal-files-organize"
      headerText={`Open ${seletedLength} ${pluralize('item', seletedLength)}`}
      isShown={isShown}
      hide={hideModal}
    >
      <ModalHeaderTop headerText={`Open ${seletedLength} ${pluralize('item', seletedLength)}`} hide={hideModal} />
      <ModalScroll>
        <OpenFileList selectedFiles={selectedFiles} onSelectedLengthChange={setSelectedLength} />
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button onClick={hideModal}>Cancel</Button>
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
