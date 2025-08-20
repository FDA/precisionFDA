import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { getSpaceIdFromScope } from '../../utils'
import { IApp } from '../apps/apps.types'
import { getBaseLink } from '../apps/run/utils'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalContentPadding } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { EditableSpace } from '../spaces/spaces.api'
import { ScopeList } from './ScopeList'

export const useForkAppToModal = ({ selectedApp }: { selectedApp?: IApp }) => {
  const { isShown, setShowModal } = useModal()
  const navigate = useNavigate()
  const [selectedTarget, setSelectedTarget] = useState<EditableSpace>()
  const sourceScope = selectedApp?.scope
  const spaceId = getSpaceIdFromScope(sourceScope)

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowModal(false)
    navigate(`/${getBaseLink(spaceId)}/apps/${selectedApp?.uid}/fork`, {
      state: {
        targetScope: selectedTarget?.scope,
        targetName: selectedTarget?.title,
      },
    })
  }

  const modalComp = (
    <ModalNext
      id="fork-app-to-modal"
      data-testid="fork-app-to-modal"
      headerText="Fork App To"
      isShown={isShown}
      hide={() => setShowModal(false)}
      variant="small"
    >
      <ModalHeaderTop headerText="Fork App To" hide={() => setShowModal(false)} />
      <ModalContentPadding>
        <ScopeList onSelect={setSelectedTarget} />
      </ModalContentPadding>
      <Footer>
        <ButtonRow>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button data-variant="primary" type="button" disabled={!selectedTarget} onClick={e => handleSubmit(e)}>
            Fork
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
