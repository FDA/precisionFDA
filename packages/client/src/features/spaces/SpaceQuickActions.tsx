import { Link } from 'react-router'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { Button } from '@/components/Button'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { ActionsMenu } from '@/components/Menu'
import { BackLink } from '@/components/Page/PageBackLink'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import type { Action } from '../home/action-types'
import { QuickActions } from '../home/home.styles'
import type { ISpaceGroup } from '../space-groups/types'
import { getDefaultSpaceUrl, isAllowedSpaceGroupType } from './helpers'
import { useAddSpacesToSpaceGroupModal } from './modals/useAddSpacesToSpaceGroupModal'
import { useRemoveSpacesFromSpaceGroupModal } from './modals/useRemoveSpacesFromSpaceGroupModal'
import type { ISpaceV2 } from './spaces.types'

const SpacesQuickActions = styled(QuickActions)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 16px 16px 20px;
`

const SpaceGroupDropdownOption = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  max-width: 600px;

  h3 {
    font-weight: 600;
    font-size: 1rem;
    color: var(--c-text-600);
  }
`

const SpaceGroupDescription = styled.p`
  &:first-letter {
    text-transform: uppercase;
  }
`

const renderSpaceGroupItem = ({ sg }: { sg: ISpaceGroup }) => {
  return (
    <SpaceGroupDropdownOption>
      <h3>{sg.name}</h3>
      <SpaceGroupDescription>{sg.description || 'No description'}</SpaceGroupDescription>
    </SpaceGroupDropdownOption>
  )
}

interface SpaceQuickActionsProps {
  spaceGroupId?: number
  spaceGroup?: ISpaceGroup
  userCanAdministerSite: boolean
  userCanAdministerSpaceGroups: boolean
  spaceGroups?: ISpaceGroup[]
  selectedItems: ISpaceV2[]
}

export const SpaceQuickActions = ({
  spaceGroupId,
  spaceGroup,
  userCanAdministerSite,
  userCanAdministerSpaceGroups,
  spaceGroups,
  selectedItems,
}: SpaceQuickActionsProps) => {
  const eligibleSelectedItems = selectedItems.filter(s => isAllowedSpaceGroupType(s.type))
  const isSelectionValidForAddingToGroup =
    eligibleSelectedItems.length > 0 && eligibleSelectedItems.length === selectedItems.length

  const addSpacesToSpaceGroup = useAddSpacesToSpaceGroupModal({
    spaces: eligibleSelectedItems,
  })

  const removeSpacesFromSpaceGroupModal = useRemoveSpacesFromSpaceGroupModal({
    spaces: selectedItems,
    spaceGroup,
  })

  const removeFromSpaceGroup = () => {
    removeSpacesFromSpaceGroupModal.setShowModal(true)
  }

  const spaceGroupActions: Action[] = (spaceGroups ?? []).map(sg => ({
    children: renderSpaceGroupItem({ sg }),
    name: `ID: ${sg.id} - ${sg.name}`,
    func: () => {
      addSpacesToSpaceGroup.openModal({ id: sg.id, name: sg.name })
    },
  }))
  const spaceGroupMessage =
    spaceGroups === undefined
      ? 'Loading space groups...'
      : spaceGroups.length === 0
        ? 'No space groups available.'
        : undefined

  return (
    <SpacesQuickActions>
      <div>
        {spaceGroupId && <BackLink linkTo={getDefaultSpaceUrl(userCanAdministerSite)}>Back to Spaces</BackLink>}
      </div>
      <QuickActions>
        {userCanAdministerSpaceGroups && !spaceGroupId && (
          <>
            <ActionsMenu
              disabled={!isSelectionValidForAddingToGroup}
              label="Add to Space Group"
              data-testid="space-list-assign-to-group-button"
              data-tooltip-id="add-to-space-group"
              data-tooltip-content="Only Group, Review, or Government spaces can be added to a space group"
            >
              <ActionsMenuContent actions={spaceGroupActions} message={spaceGroupMessage} />
            </ActionsMenu>
            {selectedItems.length > 0 && !isSelectionValidForAddingToGroup && (
              <Tooltip id="add-to-space-group" place="left" />
            )}
          </>
        )}
        {userCanAdministerSpaceGroups && spaceGroupId && spaceGroup && (
          <Button data-variant="primary" disabled={selectedItems.length === 0} onClick={removeFromSpaceGroup}>
            Remove from space group
          </Button>
        )}
        {!spaceGroupId && (
          <Button data-variant="primary" as={Link} to="/spaces/new">
            <ObjectGroupIcon height={14} /> Create Space
          </Button>
        )}
      </QuickActions>
      {removeSpacesFromSpaceGroupModal?.modalComp}
      {addSpacesToSpaceGroup?.modalComp}
    </SpacesQuickActions>
  )
}
