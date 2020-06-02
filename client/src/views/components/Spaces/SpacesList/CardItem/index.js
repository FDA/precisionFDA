import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import SpaceListShape from '../../../../shapes/SpaceListShape'
import TagsList from '../../../TagsList'
import Switcher from './Switcher'
import DataContainer from './DataContainer'
import './style.sass'


const CardItem = ({ space, lockToggleHandler }) => (
  <div className="spaces-list-card">
    <div className="spaces-list-card__header">
      <div className="spaces-list-card__title">
        { space.shared.links.show ?
          <Link to={`/spaces/${space.shared.id}`}>{space.shared.name}</Link> :
          <span>{space.shared.name}</span>
        }
      </div>
      <div>
        <Switcher space={space.shared} lockToggleHandler={lockToggleHandler} />
      </div>
    </div>

    <div className="spaces-list-card__desc">
      <div className="spaces-list-card__desc-text">{space.shared.desc}</div>
      <div>
        <TagsList tags={space.shared.tags} />
      </div>
    </div>

    <div className="row pfda-mr-t10">
      <div className="pull-right">
        <div className="spaces-list-card__date">
          <div className="spaces-list-card__date-label">Created on:</div>
          <div className="spaces-list-card__date-value">{space.shared.createdAt}</div>
        </div>
        <div className="spaces-list-card__date">
          <div className="spaces-list-card__date-label">Modified on:</div>
          <div className="spaces-list-card__date-value">{space.shared.updatedAt}</div>
        </div>
      </div>
    </div>

    <div className="spaces-list-card__body">
      {(space.hasPrivate) && <DataContainer space={space.private} />}
      <DataContainer space={space.shared} />
    </div>
  </div>
)

export default CardItem

CardItem.propTypes = {
  space: PropTypes.exact(SpaceListShape),
  lockToggleHandler: PropTypes.func,
}
