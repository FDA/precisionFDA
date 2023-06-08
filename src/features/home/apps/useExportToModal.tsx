import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { ModalHeaderTop, ModalNext } from '../../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../../modal/styles'
import { useModal } from '../../modal/useModal'

const StyledExportTo = styled.div`
  min-width: 400px;
  padding: 1rem;
  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    font-size: 14px;
    cursor: pointer;
    display: flex;

    a {
      padding: 5px 15px;
      flex: 1 0 auto;
      color: #333333;
      display: block;

      &:hover {
        background: #f5f5f5;
      }
    }
  }
`

type ValType = 'docker' | 'cwl' | 'wdl'
type ExportType = {
  label: string
  link?: string
  isPost?: boolean
  value: ValType
}
const getConfirmationMessage = (title: ValType) => {
  switch (title) {
    case 'docker': {
      return 'You are about to download a Dockerfile to run this app in a Docker container on your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'cwl': {
      return 'You are about to download a CWL Tool package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    case 'wdl': {
      return 'You are about to download a WDL Task package to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
    default: {
      return 'You are about to download a file to your local machine. For more information please consult the app export section in the precisionFDA docs.'
    }
  }
}

export function useExportToModal<
  T extends {
    id: string
    name: string
    links?: { export?: string; cwl_export?: string; wdl_export?: string }
  },
>({ selected }: { selected: T }) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const exportOptions = [
    {
      label: 'Docker Container',
      link: momoSelected?.links?.export,
      isPost: true,
      value: 'docker',
    } as ExportType,
    {
      label: 'CWL Tool',
      link: momoSelected?.links?.cwl_export,
      value: 'cwl',
    } as ExportType,
    {
      label: 'WDL Task',
      link: momoSelected?.links?.wdl_export,
      value: 'wdl',
    } as ExportType,
  ].filter(e => e.link !== undefined)

  const modalComp = (
    <ModalNext
      data-testid="modal-export-to"
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText="Export to"
        hide={() => setShowModal(false)}
      />
      <ModalScroll>
        <StyledExportTo>
          <ul>
            {exportOptions.map(e => (
              <li key={e.label}>
                <a
                  href={e.link}
                  data-turbolinks="false"
                  data-confirm={e.value && getConfirmationMessage(e.value)}
                  data-method={e.isPost && 'post'}
                  download
                >
                  {e.label}
                </a>
              </li>
            ))}
          </ul>
        </StyledExportTo>
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
