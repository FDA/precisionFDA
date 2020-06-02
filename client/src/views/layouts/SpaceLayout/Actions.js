import React from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { shallowEqual, useSelector, useDispatch } from 'react-redux'

import Button from '../../components/Button'
import LockSpaceModal from '../../components/Space/LayoutModals/LockSpaceModal'
import UnlockSpaceModal from '../../components/Space/LayoutModals/UnlockSpaceModal'
import DeleteSpaceModal from '../../components/Space/LayoutModals/DeleteSpaceModal'
import {
  showLayoutLockModal,
  showLayoutUnlockModal,
  showLayoutDeleteModal,
} from '../../../actions/spaces'
import { createSpaceLinkSelector } from '../../../reducers/context/selectors'
import { spaceCanDuplicateSelector } from '../../../reducers/spaces/space/selectors'


const Actions = ({ links = {}}) => {
  const { spaceId } = useParams()
  const createSpaceLink = useSelector(createSpaceLinkSelector, shallowEqual)
  const isDuplicable = useSelector(spaceCanDuplicateSelector)

  const dispatch = useDispatch()
  const showLockModal = () => dispatch(showLayoutLockModal())
  const showUnlockModal = () => dispatch(showLayoutUnlockModal())
  const showDeleteModal = () => dispatch(showLayoutDeleteModal())

  return (
    <div className="space-page-layout__actions">
      <Link to="/spaces">
        <Button type="primary">Back</Button>
      </Link>
      {(links.update) &&
        <Link to={`/spaces/edit/${spaceId}`}>
          <Button>Edit Space</Button>
        </Link>
      }
      { createSpaceLink && isDuplicable &&
        <Link to={`/spaces/duplicate/${spaceId}`}>
          <Button>Duplicate Space</Button>
        </Link>
      }
      {(links.lock) && <Button onClick={showLockModal}>Lock Space</Button>}
      {(links.unlock) && <Button onClick={showUnlockModal}>Unlock Space</Button>}
      {(links.delete) && <Button onClick={showDeleteModal}>Delete Space</Button>}

      {(links.lock) && <LockSpaceModal lockLink={links.lock} />}
      {(links.unlock) && <UnlockSpaceModal unlockLink={links.unlock} />}
      {(links.delete) && <DeleteSpaceModal deleteLink={links.delete} />}
    </div>
  )
}

export default Actions

Actions.propTypes = {
  links: PropTypes.object,
}
