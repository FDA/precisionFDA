/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { DownloadIcon } from '../../../components/icons/DownloadIcon'
import { FileIcon } from '../../../components/icons/FileIcon'
import { VerticalCenter } from '../../../components/Page/styles'
import {
  ResourceTable,
  StyledAction,
  StyledName,
} from '../../../components/ResourceTable'
import { itemsCountString } from '../../../utils/formatting'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'
import { IAsset } from '../assets.types'

const StyledAssetsList = styled.div`
  padding-left: 16px;
`

export function useDownloadAssetsModal(selectedFiles: IAsset[]) {
  const { isShown, setShowModal } = useModal()
  const handleDownloadClick = (item: IAsset) => {
    if (item.links.download) {
      const win = window.open(item.links.download, '_blank')
      win?.focus()
    }
  }

  const memoSelected = useMemo(() => selectedFiles, [isShown])

  const modalComp = (
    <ModalNext
      data-testid="modal-assets-download"
      isShown={Boolean(isShown)}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Download ${itemsCountString(
          'asset',
          memoSelected.length,
        )}?`}
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledAssetsList>
          <ResourceTable
            rows={memoSelected.map((s, i) => ({
              name: (
                <StyledName
                  key={`${i}-name`}
                  data-turbolinks="false"
                  href={s.links.show}
                  target="_blank"
                >
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
            }))}
          />
        </StyledAssetsList>
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
