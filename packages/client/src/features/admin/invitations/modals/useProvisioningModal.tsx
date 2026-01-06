import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { ModalNext } from '../../../modal/ModalNext'
import { useModal } from '../../../modal/useModal'
import { pluralize } from '../../../../utils/formatting'
import { RowSelectionState } from '@tanstack/react-table'
import styled from 'styled-components'
import { useProvisionMutation } from '../../../../api/mutations/invitation'
import { Button } from '../../../../components/Button'
import { Checkbox } from '../../../../components/Checkbox'
import { fetchFDAPortals, Invitation } from '../../users/api'

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: var(--tertiary-100);
`

const HeaderContent = styled.div`
  flex: 1;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  margin-left: 16px;
  flex-shrink: 0;

  &:hover {
    background: #e2e8f0;
    color: #374151;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
`

const Subtitle = styled.p`
  margin: 0;
  color: var(--warning-500);
  font-size: 14px;
  line-height: 1.5;
`

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  max-height: 400px;
`

const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`

const SelectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SelectionCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #3b82f6;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const ControlButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const PortalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
`

const PortalCard = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid ${props => (props.$isSelected ? '#3b82f6' : '#e2e8f0')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${props => (props.$isSelected ? '#2563eb' : '#cbd5e1')};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`

export const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  appearance: none;
  background: white;
  transition: all 0.2s ease;

  &:checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  &:hover {
    border-color: #9ca3af;
  }
`

const PortalName = styled.span`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 16px;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
`

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const StyledForm = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const ProvisioningModal = ({
  invitations,
  handleClose,
  setSelectedIndexes,
}: {
  invitations: Invitation[]
  handleClose: () => void
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>
}) => {
  const [selectedSpaces, setSelectedSpaces] = useState<Set<number>>(new Set())

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['fda-space-group'],
    queryFn: fetchFDAPortals,
  })

  // preselect all portals once loaded
  useEffect(() => {
    setSelectedSpaces(new Set(spaces.map(({ id }) => id)))
  }, [spaces])

  const provisionMutation = useProvisionMutation({
    invitations,
    selectedSpaces,
    onSuccess: () => setSelectedIndexes({}),
  })

  const handleSpaceToggle = (spaceId: number) => {
    setSelectedSpaces(prev => {
      const newSet = new Set(prev)
      newSet.has(spaceId) ? newSet.delete(spaceId) : newSet.add(spaceId)
      return newSet
    })
  }

  const handleSelectAll = () => setSelectedSpaces(new Set(spaces.map(({ id }) => id)))
  const handleUnselectAll = () => setSelectedSpaces(new Set())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    provisionMutation.mutate()
  }

  const isSubmitting = provisionMutation.isPending

  if (isLoading) {
    return (
      <ModalContainer>
        <Header>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </Header>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer>
      <Header>
        <HeaderContent>
          <Title>Provision Users - FDA Portals Selection</Title>
          <Subtitle>This selection only applies to users with FDA email domains (fda.hhs.gov, fda.gov).</Subtitle>
        </HeaderContent>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </Header>

      <Content>
        <StyledForm id="edit-invitation-form" onSubmit={handleSubmit}>
          <ControlsSection>
            <SelectionInfo>
              <SelectionCount>
                {selectedSpaces.size} of {spaces.length} selected
              </SelectionCount>
            </SelectionInfo>
            <ButtonGroup>
              <ControlButton type="button" onClick={handleSelectAll}>
                Select All
              </ControlButton>
              <ControlButton type="button" onClick={handleUnselectAll}>
                Clear All
              </ControlButton>
            </ButtonGroup>
          </ControlsSection>

          <PortalGrid>
            {spaces.map(space => (
              <PortalCard key={space.id} $isSelected={selectedSpaces.has(space.id)}>
                <Checkbox checked={selectedSpaces.has(space.id)} onChange={() => handleSpaceToggle(space.id)} />
                <PortalName>{space.name}</PortalName>
              </PortalCard>
            ))}
          </PortalGrid>
        </StyledForm>
      </Content>

      <Footer>
        <ButtonRow>
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button data-variant="primary" type="submit" form="edit-invitation-form" disabled={isSubmitting}>
            {isSubmitting ? 'Provisioning...' : `Provision ${invitations.length} ${pluralize('User', invitations.length)}`}
          </Button>
        </ButtonRow>
      </Footer>
    </ModalContainer>
  )
}

export const useProvisioningModal = (
  invitations: Invitation[],
  setSelectedIndexes: React.Dispatch<React.SetStateAction<RowSelectionState>>,
) => {
  const { isShown, setShowModal } = useModal()
  const handleClose = () => {
    setShowModal(false)
  }

  const modalComp = (
    <ModalNext id="modal-provisioning" data-testid="modal-provisioning" isShown={isShown} hide={handleClose} variant="large">
      <ProvisioningModal invitations={invitations} handleClose={handleClose} setSelectedIndexes={setSelectedIndexes} />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
