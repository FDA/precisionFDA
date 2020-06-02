import React from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

import SpaceShape from '../../shapes/SpaceShape'
import Icon from '../../components/Icon'


const Tabs = ({ space }) => {
  const { page } = useParams()
  const showPrivateLink = !space.isPrivate && space.privateSpaceId || space.isPrivate

  const privateUrl = (space.isPrivate) ? `/spaces/${space.id}/${page}` : `/spaces/${space.privateSpaceId}/${page}`
  const sharedUrl = (!space.isPrivate) ? `/spaces/${space.id}/${page}` : `/spaces/${space.sharedSpaceId}/${page}`

  const privateClasses = classNames({
    'space-page-layout__tab--active': space.isPrivate,
  }, 'space-page-layout__tab')

  const sharedClasses = classNames({
    'space-page-layout__tab--active': !space.isPrivate,
  }, 'space-page-layout__tab', 'space-page-layout__tab--shared')

  return (
    <div className="space-page-layout__tabs">
      {(showPrivateLink) && (
        <Link to={privateUrl} className={privateClasses}>
          <Icon icon="fa-eye-slash" />
          Private Area
        </Link>
      )}
      <Link to={sharedUrl} className={sharedClasses}>
        <Icon icon="fa-users" />
        Shared Area
      </Link>
    </div>
  )
}

export default Tabs

Tabs.propTypes = {
  space: PropTypes.shape(SpaceShape),
}
