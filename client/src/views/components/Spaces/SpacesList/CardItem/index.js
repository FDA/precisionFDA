import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import SpaceListShape from '../../../../shapes/SpaceListShape'
import TagsList from '../../../TagsList'
import Switcher from './Switcher'
import DataContainer from './DataContainer'
// eslint-disable-next-line
import './style.sass'

const CardItem = ({ space, lockToggleHandler }) => {
  const chackExclusiveSpace = space.hasPrivate && space.private.isExclusive
  const spaceArea = chackExclusiveSpace ? space.private : space.shared

  return (
    <div className="spaces-list-card">
      <div className="spaces-list-card__header">
        <div className="spaces-list-card__title">
          {spaceArea.links.show ? (
            <Link
              to={`/spaces/${spaceArea.id}`}
              aria-label={`This link will navigate to ${spaceArea.name} Space`}
            >
              {spaceArea.name}
            </Link>
          ) : (
            <span>{spaceArea.name}</span>
          )}
        </div>
        <div>
          <Switcher space={spaceArea} lockToggleHandler={lockToggleHandler} />
        </div>
      </div>

      <div className="spaces-list-card__desc">
        <div className="spaces-list-card__desc-text">{spaceArea.desc}</div>
        <div>
          <TagsList tags={spaceArea.tags} />
        </div>
      </div>

      <div className="row pfda-mr-t10">
        <div className="pull-right">
          <div className="spaces-list-card__date">
            <div className="spaces-list-card__date-label">Created on:</div>
            <div className="spaces-list-card__date-value">
              {spaceArea.createdAt}
            </div>
          </div>
          <div className="spaces-list-card__date">
            <div className="spaces-list-card__date-label">Modified on:</div>
            <div className="spaces-list-card__date-value">
              {spaceArea.updatedAt}
            </div>
          </div>
        </div>
      </div>

      <div className="spaces-list-card__body">
        {(space.hasPrivate || space.isExclusive) && (
          <DataContainer space={space.private} />
        )}
        {!spaceArea.isExclusive && <DataContainer space={space.shared} />}
      </div>
    </div>
  )
}

export default CardItem

CardItem.propTypes = {
  space: PropTypes.exact(SpaceListShape),
  lockToggleHandler: PropTypes.func,
}
