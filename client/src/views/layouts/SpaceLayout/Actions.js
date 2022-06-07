import React from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Button from '../../components/Button'
import LockSpaceModal from '../../components/Space/LayoutModals/LockSpaceModal'
import UnlockSpaceModal from '../../components/Space/LayoutModals/UnlockSpaceModal'
import DeleteSpaceModal from '../../components/Space/LayoutModals/DeleteSpaceModal'
import { CreateSpaceModal } from '../../components/Space/LayoutModals/CreateSpaceModal'
import {
  showLayoutLockModal,
  showLayoutUnlockModal,
  showLayoutDeleteModal,
  showLayoutCreateSpaceModal,
} from '../../../actions/spaces'
import { createSpaceLinkSelector } from '../../../reducers/context/selectors'
import { spaceCanDuplicateSelector } from '../../../reducers/spaces/space/selectors'
import { NEW_SPACE_PAGE_ACTIONS } from '../../../constants'


const Actions = ({ links = {}}) => {
  const { spaceId } = useParams()
  const createSpaceLink = useSelector(createSpaceLinkSelector, shallowEqual)
  const isDuplicable = useSelector(spaceCanDuplicateSelector)

  const dispatch = useDispatch()
  const showLockModal = () => dispatch(showLayoutLockModal())
  const showUnlockModal = () => dispatch(showLayoutUnlockModal())
  const showDeleteModal = () => dispatch(showLayoutDeleteModal())
  const showCreateSpaceModal = () => dispatch(showLayoutCreateSpaceModal())

  return (
    <div className="space-page-layout__actions">
      <Link to="/spaces" className="btn btn-primary">
        Back
      </Link>
      {(links.update) &&
        <Button onClick={() => showCreateSpaceModal(NEW_SPACE_PAGE_ACTIONS.EDIT)}>Edit Space</Button>}
      { createSpaceLink && isDuplicable &&
        <Link to={`/spaces/duplicate/${spaceId}`} className="btn btn-default btn-spaces-margin">
          Duplicate Space
        </Link>
      }
      {(links.lock) && <Button onClick={showLockModal}>Lock Space</Button>}
      {(links.unlock) && <Button onClick={showUnlockModal}>Unlock Space</Button>}
      {(links.delete) && <Button onClick={showDeleteModal}>Delete Space</Button>}

      {(links.lock) && <LockSpaceModal lockLink={links.lock} />}
      {(links.unlock) && <UnlockSpaceModal unlockLink={links.unlock} />}
      {(links.delete) && <DeleteSpaceModal deleteLink={links.delete} />}
      {(links.update) &&
        <CreateSpaceModal
          action={NEW_SPACE_PAGE_ACTIONS.EDIT}
        />
      }
    </div>
  )
}

export default Actions

Actions.propTypes = {
  links: PropTypes.object,
}
