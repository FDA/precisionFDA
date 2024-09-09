import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'

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
      display: block;
    }
  }
`

type ValType = 'docker' | 'cwl' | 'wdl'
type ExportType = {
  label: string
  link?: string
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

export type ExportToResource = 'apps' | 'workflows'

export function useExportToModal<
  T extends {
    id: number
    name: string
    uid: string
    links?: { export?: string; cwl_export?: string; wdl_export?: string }
  },
>({ selected, resource }: { selected: T; resource: ExportToResource }) {
  const { isShown, setShowModal } = useModal()
  const momoSelected = useMemo(() => selected, [isShown])

  const handleClick = (e, ex) => {
    if (ex.value) {
      const confirmationMessage = getConfirmationMessage(ex.value)
      if (!window.confirm(confirmationMessage)) {
        e.preventDefault()
      }
    }
  }

  const exportOptions = [
    {
      label: 'Docker Container',
      link: `/${resource}/${momoSelected?.uid}/export`,
      value: 'docker',
    } as ExportType,
    {
      label: 'CWL Tool',
      link: `/${resource}/${momoSelected?.uid}/cwl_export`,
      value: 'cwl',
    } as ExportType,
    {
      label: 'WDL Task',
      link: `/${resource}/${momoSelected?.uid}/wdl_export`,
      value: 'wdl',
    } as ExportType,
  ].filter(e => e.link !== undefined)

  const modalComp = (
    <ModalNext
      id="modal-export-to"
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
                  onClick={(event) => handleClick(event, e)}
                  href={e.link}
                  data-turbolinks="false"
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
