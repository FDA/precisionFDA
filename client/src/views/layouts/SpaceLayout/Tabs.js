import React from 'react'
import { Link, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import SpaceShape from '../../shapes/SpaceShape'
import Icon from '../../components/Icon'
// eslint-disable-next-line
import { SPACE_PRIVATE_TYPE } from '../../../constants'

const Tabs = ({ space }) => {
  const { page } = useParams()
  const showPrivateLink =
    (!space.isPrivate && space.privateSpaceId) || space.isPrivate

  const showExclusiveLink = space.type === SPACE_PRIVATE_TYPE

  const privateUrl =
    space.isPrivate || space.type === SPACE_PRIVATE_TYPE
      ? `/spaces/${space.id}/${page}`
      : `/spaces/${space.privateSpaceId}/${page}`

  const sharedUrl = !space.isPrivate
    ? `/spaces/${space.id}/${page}`
    : `/spaces/${space.sharedSpaceId}/${page}`

  const exclusiveClasses = classNames(
    {
      'space-page-layout__tab--active': space.type === SPACE_PRIVATE_TYPE,
    },
    'space-page-layout__tab',
    'space-page-layout__tab--exclusive',
  )

  const privateClasses = classNames(
    {
      'space-page-layout__tab--active': space.isPrivate,
    },
    'space-page-layout__tab',
  )

  const sharedClasses = classNames(
    {
      'space-page-layout__tab--active': !space.isPrivate,
    },
    'space-page-layout__tab',
    'space-page-layout__tab--shared',
  )

  return (
    <div className="space-page-layout__tabs">
      {showExclusiveLink && (
        <Link to={privateUrl} className={exclusiveClasses}>
          <Icon icon="fa-eye-slash" />
          Private Area
        </Link>
      )}
      {showPrivateLink && (
        <Link to={privateUrl} className={privateClasses}>
          <Icon icon="fa-eye-slash" />
          Private Area
        </Link>
      )}
      {!showExclusiveLink && (
        <Link to={sharedUrl} className={sharedClasses}>
          <Icon icon="fa-users" />
          Shared Area
        </Link>
      )}
    </div>
  )
}

export default Tabs

Tabs.propTypes = {
  space: PropTypes.shape(SpaceShape),
}
