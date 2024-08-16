import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { VerticalCenter } from '../../../components/Page/styles'
import { ResourceTable, StyledAction, StyledName } from '../../../components/ResourceTable'
import { FileIcon } from '../../../components/icons/FileIcon'
import { FolderIcon } from '../../../components/icons/FolderIcon'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { DownloadListResponse, ServerScope } from '../../home/types'
import { fetchFilesDownloadList } from '../files.api'
import { IFile } from '../files.types'
import { DownloadIcon } from '../../../components/icons/DownloadIcon'

const StyledResourceTable = styled(ResourceTable)`
  padding: 12px;
`
const StyledLoader = styled.div`
  padding: 12px;
`
const StyledPath = styled.div`
  min-width: 150px;
`

const handleDownloadClick = (downloadURL: string) => {
  const win = window.open(downloadURL, '_blank')
  win?.focus()
}

const DownloadFiles = ({
  selected,
  setNodesToBeDownloaded,
}: {
  selected: IFile[]
  setNodesToBeDownloaded: (nodes: DownloadListResponse[]) => void,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['download_list', selected],
    queryFn: async () => {
      const fileIds = selected.map(file => file.id)

      return fetchFilesDownloadList(fileIds, 'download', selected[0].scope)
        .then(res => {
          setNodesToBeDownloaded(res)
          return res
        })
        .catch(error => {
          toast.error('Error: Fetching download list')
          throw error
        })
    },
  })
  if (isLoading) return <StyledLoader>Loading...</StyledLoader>
  return (
    data ? (
      <StyledResourceTable
        rows={data.map((s) => ({
          name: (
            <StyledName href={s.viewURL} target="_blank">
              <VerticalCenter>
                {s.type === 'file' ? <FileIcon /> : <FolderIcon />}
              </VerticalCenter>
              {s.name}
            </StyledName>
          ),
          path: <StyledPath>{s.fsPath}</StyledPath>,
          action: (
            <StyledAction
              key={`${s.id}-action`}
              onClick={() => handleDownloadClick(s.downloadURL)}
            >
              <DownloadIcon />
              Download
            </StyledAction>
          ),
        }))}
      />
    ) : <div />
  )
}

export const useDownloadFileModal = (selected: IFile[], scope: ServerScope) => {
  const { isShown, setShowModal } = useModal()
  const memoSelected = useMemo(() => selected, [isShown])
  const [nodesToBeDownloaded, setNodesToBeDownloaded] = useState<DownloadListResponse[]>()

  const downloadUrl = (scopeParam: ServerScope) => {
    const params = selected.map(file => `id[]=${file.id}`).join('&')
    return `/api/files/bulk_download?scope=${scopeParam}&${params}`
  }

  const modalComp = (
    <ModalNext
      id="modal-download"
      data-test-id="modal-download"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Download ${nodesToBeDownloaded ? itemsCountString('item', nodesToBeDownloaded.length) : '...'}`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <DownloadFiles selected={memoSelected} setNodesToBeDownloaded={setNodesToBeDownloaded}/>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button data-variant='primary' onClick={() => {
            handleDownloadClick(downloadUrl(scope))
            setShowModal(false)
            toast.success('Download all has been started')
          }}>
            Download All as Archive
          </Button>
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
