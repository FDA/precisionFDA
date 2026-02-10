import React from 'react'
import { Link } from 'react-router'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { ActionsMenu } from '../../components/Menu'
import { BackLink } from '../../components/Page/PageBackLink'
import { Action } from '../home/action-types'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { QuickActions } from '../home/home.styles'
import { ISpaceGroup } from '../space-groups/types'
import { getDefaultSpaceUrl, isAllowedSpaceGroupType } from './helpers'
import { useAddSpacesToSpaceGroupModal } from './modals/useAddSpacesToSpaceGroupModal'
import { useRemoveSpacesFromSpaceGroupModal } from './modals/useRemoveSpacesFromSpaceGroupModal'
import { ISpaceV2 } from './spaces.types'

const SpacesQuickActions = styled(QuickActions)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 16px;
  padding-left: 20px;
  padding-right: 16px;
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

const useSpaceGroupDropdownOptions = (
  spaceGroups: ISpaceGroup[] | undefined,
  addSpacesToSpaceGroupModal: ReturnType<typeof useAddSpacesToSpaceGroupModal>,
) => {
  return React.useCallback(() => {
    if (!spaceGroups) {
      return []
    }
    return spaceGroups.map(
      sg =>
        ({
          children: renderSpaceGroupItem({ sg }),
          name: `ID: ${sg.id} - ${sg.name}`,
          isDisabled: false,
          func: async () => {
            addSpacesToSpaceGroupModal.openModal({ id: sg.id, name: sg.name })
          },
        }) as Action,
    )
  }, [spaceGroups, addSpacesToSpaceGroupModal])
}

export const SpaceQuickActions = ({
  spaceGroupId,
  spaceGroup,
  userCanAdministerSite,
  userCanAdministerSpaceGroups,
  spaceGroups,
  selectedItems,
}: {
  spaceGroupId?: number
  spaceGroup?: ISpaceGroup
  userCanAdministerSite: boolean
  userCanAdministerSpaceGroups: boolean
  spaceGroups?: ISpaceGroup[]
  selectedItems: ISpaceV2[]
}) => {
  const isSelectionValidForAddingToGroup = selectedItems.length > 0 && selectedItems.every(s => isAllowedSpaceGroupType(s.type))

  const addSpacesToSpaceGroup = useAddSpacesToSpaceGroupModal({
    spaces: selectedItems.filter(s => isAllowedSpaceGroupType(s.type)),
  })

  const removeSpacesFromSpaceGroupModal = useRemoveSpacesFromSpaceGroupModal({
    spaces: selectedItems,
    spaceGroup: spaceGroup!,
  })

  const removeFromSpaceGroup = () => {
    removeSpacesFromSpaceGroupModal.setShowModal(true)
  }

  const spaceGroupAction = useSpaceGroupDropdownOptions(spaceGroups, addSpacesToSpaceGroup)()

  return (
    <SpacesQuickActions>
      <div>{spaceGroupId && <BackLink linkTo={getDefaultSpaceUrl(userCanAdministerSite)}>Back to Spaces</BackLink>}</div>
      <QuickActions>
        {userCanAdministerSpaceGroups && !spaceGroupId && (
          <>
            <ActionsMenu
              disabled={!isSelectionValidForAddingToGroup}
              label="Add to Space Group"
              data-testid="space-list-assign-to-group-button"
              data-tooltip-id="add-to-space-group"
              data-tooltip-content={'Only Group, Review, or Government spaces can be added to a space group'}
            >
              <ActionsMenuContent actions={spaceGroupAction} />
            </ActionsMenu>
            {selectedItems.length > 0 && !isSelectionValidForAddingToGroup && <Tooltip id="add-to-space-group" place="left" />}
          </>
        )}
        {userCanAdministerSpaceGroups && spaceGroupId && (
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
