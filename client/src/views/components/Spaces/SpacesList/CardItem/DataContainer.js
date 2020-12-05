import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

import Counter from './Counter'
import UserShape from '../../../../shapes/UserShape'
import SpaceShape from '../../../../shapes/SpaceShape'
import { SPACE_REVIEW } from '../../../../../constants'


const UserLink = ({ user, helperText }) => (
  <div className="spaces-list-card-data__lead">
    <a href={user.url}>
      {`${user.name} ${helperText}`}
    </a>
  </div>
)

const DataContainer = ({ space }) => {
  const typeTitle = (space.isPrivate) ? 'Private Area' : 'Shared Area'
  const classes = classNames({
    'spaces-list-card-data': true,
    'spaces-list-card-data--private': space.isPrivate,
    'spaces-list-card-data--shared': !space.isPrivate,
  })

  return (
    <div className={classes}>
      <div className="pfda-padded-b10">
        <div className="spaces-list-card-data__title">
          { space.links.show ?
            <Link to={`/spaces/${space.id}`}>{typeTitle}</Link> :
            <span>{typeTitle}</span>
          }
        </div>
      </div>

      <div className="spaces-list-card-data__leaders">
        { (space.isPrivate && space.hostLead) &&
          <UserLink user={space.hostLead} helperText="(Lead)" />
        }
        { (!space.isPrivate && space.hostLead) &&
          <UserLink user={space.hostLead} helperText={`(${space.type === SPACE_REVIEW ? 'Reviewer' : 'Host'} Lead)`} />
        }
        { (!space.isPrivate && space.guestLead) &&
          <UserLink user={space.guestLead} helperText={`(${space.type === SPACE_REVIEW ? 'Sponsor' : 'Space'} Lead)`} />
        }
      </div>

      <div className="spaces-list-card-data__counters">
        <Counter type="files" counter={space.counters.files} />
        <Counter type="apps" counter={space.counters.apps} />
        <Counter type="workflows" counter={space.counters.workflows} />
        <Counter type="jobs" counter={space.counters.jobs} />
        <Counter type="members" counter={space.counters.members} />
      </div>

    </div>
  )
}

export default DataContainer


DataContainer.propTypes = {
  space: PropTypes.exact(SpaceShape),
}

UserLink.propTypes = {
  user: PropTypes.shape(UserShape),
  helperText: PropTypes.string,
}
