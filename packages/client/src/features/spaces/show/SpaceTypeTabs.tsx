import React from 'react'
import { Link } from 'react-router'
import { ISpace } from '../spaces.types'
import { Tab, Tabs } from './styles'
import { ResourceTypeUrlNames } from '../../home/types'

const privateTextShort = 'Only you can view and edit resources.'
const privateReviewTextShort = 'Only you and other hosts can view and edit resources.'
const sharedTextShort = 'Members can view, add, and edit resources.'

export const SpaceTypeTabs = ({ space, activeResource }: { space: ISpace; activeResource?: ResourceTypeUrlNames }) => {
  const currentUserSide = space.current_user_membership.side
  const sideText = currentUserSide === 'host' ? 'Review' : 'Sponsor'
  return (
    <Tabs>
      {space.type === 'review' && (
        <>
          <Tab
            as={Link}
            data-variant="private"
            data-isactive={space.private_space_id ? 'false' : 'true'}
            to={`/spaces/${space.private_space_id || space.id}/${activeResource}`}
          >
            {sideText}&nbsp;Private Area
            <p>{privateReviewTextShort}</p>
          </Tab>
          <Tab
            as={Link}
            data-variant="shared"
            data-isactive={space.shared_space_id ? 'false' : 'true'}
            to={`/spaces/${space.shared_space_id || space.id}/${activeResource}`}
          >
            Shared Area
            <p>{sharedTextShort}</p>
          </Tab>
        </>
      )}

      {space.type === 'review' && !space.shared_space_id && !space.private_space_id && (
        <Tab data-variant="shared" data-isactive="true">
          Shared Area
          <p>{sharedTextShort}</p>
        </Tab>
      )}
      {space.type === 'private_type' && (
        <Tab data-variant="private" as="div" data-isactive="true">
          Private Area
          <p>{privateTextShort}</p>
        </Tab>
      )}
      {space.type === 'groups' && (
        <Tab data-variant="shared" data-isactive="true">
          Shared Area
          <p>{sharedTextShort}</p>
        </Tab>
      )}
    </Tabs>
  )
}
