import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import SpaceListShape from '../../../shapes/SpaceListShape'
import PaginationShape from '../../../shapes/PaginationShape'
import SpaceShape from '../../../shapes/SpaceShape'
import UserShape from '../../../shapes/UserShape'
import TagsList from '../../TagsList'
import ToggleSwitch from './ToggleSwitch'
import { Table, Tbody, Th, Thead } from '../../TableComponents'
import Pagination from '../../TableComponents/Pagination'
// eslint-disable-next-line
import { SPACE_PRIVATE_TYPE } from '../../../../constants'

const UserLink = ({ user }) => <a href={user.url}>{user.name}</a>

const PrivateCells = ({ space }) => {
  const isAccessible = !!space.links.show
  const tdClasses = {
    'spaces-list-table__private-row': space?.isPrivate || space.isExclusive,
    'td-underline': isAccessible,
  }
  return (
    <>
      <td className={classNames(tdClasses)}>
        {isAccessible ? (
          <Link
            to={`/spaces/${space.id}`}
            aria-label={`Click this link to navigate to Private Space ID ${space.id}`}
          >
            Private
          </Link>
        ) : (
          <span>Private</span>
        )}
      </td>
      <td className="spaces-list-table__private-row">
        {space.hostLead && <UserLink user={space.hostLead} />}
      </td>
      <td className="spaces-list-table__private-row" />
    </>
  )
}

const SharedCells = ({ space, hasPrivate }) => {
  const sharedRowspan = hasPrivate ? 1 : 2
  const isAccessible = !!space.links.show
  const tdClasses = {
    'spaces-list-table__shared-row': !space.isPrivate && !space.isExclusive,
    'td-underline': isAccessible,
  }

  return (
    <>
      <td className={classNames(tdClasses)} rowSpan={sharedRowspan}>
        {isAccessible ? (
          <Link
            to={`/spaces/${space.id}`}
            aria-label={`Click this link to navigate to Space ID ${space.id}`}
          >
            Shared
          </Link>
        ) : (
          <span>Shared</span>
        )}
      </td>
      <td
        aria-label={`Click this link to navigate to the ${space.hostLead?.name} profile page`}
        className="spaces-list-table__shared-row"
        rowSpan={sharedRowspan}
      >
        {space.hostLead && <UserLink user={space.hostLead} />}
      </td>
      <td
        aria-label={`Click this link to navigate to the ${space.guestLead?.name} profile page`}
        className="spaces-list-table__shared-row"
        rowSpan={sharedRowspan}
      >
        {space.guestLead && <UserLink user={space.guestLead} />}
      </td>
    </>
  )
}

const ToggleCell = ({ space, lockToggleHandler }) => {
  const classes = classNames(
    'spaces-list-table__switcher',
    `spaces-list-table__switcher--${space.status}`,
    `remediation-table-switcher-${space.status}`,
  )
  return (
    <td rowSpan="2" className="spaces-list-table__switcher-td">
      <div className={classes}>
        {space.hasLockLink && (
          <div>
            <ToggleSwitch
              space={space}
              vertical
              toggleHandler={lockToggleHandler}
            />
          </div>
        )}
        <div className="spaces-list-table__switcher-label">{space.status}</div>
      </div>
    </td>
  )
}

const Row = ({ space, lockToggleHandler }) => {
  const paddTrClasses = classNames(
    'spaces-list-table__tr',
    'spaces-list-table__tr--padding',
  )
  const topTrClasses = classNames(
    'spaces-list-table__tr',
    'spaces-list-table__tr--top',
  )
  const bottomTrClasses = classNames(
    'spaces-list-table__tr',
    'spaces-list-table__tr--bottom',
  )

  const chackExclusiveSpace =
    space.hasPrivate &&
    space.private.isExclusive &&
    space.private.type === SPACE_PRIVATE_TYPE
  const spaceArea = chackExclusiveSpace ? space.private : space.shared
  const spaceAreaType =
    spaceArea.type === SPACE_PRIVATE_TYPE ? 'private' : spaceArea.type

  return (
    <>
      <tr className={paddTrClasses}>
        <td colSpan="9" />
      </tr>
      <tr className={topTrClasses}>
        <ToggleCell space={spaceArea} lockToggleHandler={lockToggleHandler} />
        <td className="spaces-list-table__title">
          {spaceArea.links?.show ? (
            <Link
              aria-label={`This link will navigate to ${spaceArea.name} Space`}
              to={`/spaces/${spaceArea.id}`}
            >
              {spaceArea.name}
            </Link>
          ) : (
            <span>{spaceArea.name}</span>
          )}
        </td>
        <td>{spaceAreaType}</td>
        <td rowSpan="2" className="spaces-list-table__tags">
          <TagsList tags={spaceArea.tags} />
        </td>
        <td>{spaceArea.createdAt}</td>
        <td>{spaceArea.updatedAt}</td>
        {space.hasPrivate || spaceArea.isExclusive ? (
          <PrivateCells space={space.private} />
        ) : (
          <SharedCells space={space.shared} />
        )}
      </tr>

      <tr className={bottomTrClasses}>
        {space.hasPrivate && !spaceArea.isExclusive && (
          <>
            <td colSpan="2">{spaceArea.desc}</td>
            <td colSpan="2" />
            {space.hasPrivate && !spaceArea.isExclusive && (
              <SharedCells space={space.shared} hasPrivate />
            )}
          </>
        )}
      </tr>
    </>
  )
}

const SpacesTable = props => {
  const { spaces, sortType, sortDir, pagintion } = props
  const { sortHandler, lockToggleHandler, setPageHandler } = props

  return (
    <div className="spaces-list-table">
      <Table>
        <Thead>
          <Th class_name="spaces-list-headers-grey">space state</Th>
          <Th
            sortType={sortType}
            sortDir={sortDir}
            type="name"
            sortHandler={sortHandler}
            class_name="spaces-list-headers-blue"
          >
            name
          </Th>
          <Th
            sortType={sortType}
            sortDir={sortDir}
            type="type"
            sortHandler={sortHandler}
            class_name="spaces-list-headers-blue"
          >
            type
          </Th>
          <Th class_name="spaces-list-headers-grey">tags</Th>
          <Th
            sortType={sortType}
            sortDir={sortDir}
            type="created_at"
            sortHandler={sortHandler}
            class_name="spaces-list-headers-blue"
          >
            created on
          </Th>
          <Th
            sortType={sortType}
            sortDir={sortDir}
            type="updated_at"
            sortHandler={sortHandler}
            class_name="spaces-list-headers-blue"
          >
            modified on
          </Th>
          <Th class_name="spaces-list-headers-grey">area type</Th>
          <Th class_name="spaces-list-headers-grey">reviewer/host lead</Th>
          <Th class_name="spaces-list-headers-grey">sponsor/guest lead</Th>
        </Thead>
        <Tbody>
          {spaces.map(space => (
            <Row
              space={space}
              key={space.id}
              lockToggleHandler={lockToggleHandler}
            />
          ))}
        </Tbody>
      </Table>
      <Pagination data={pagintion} setPageHandler={setPageHandler} />
    </div>
  )
}

export default SpacesTable

SpacesTable.propTypes = {
  spaces: PropTypes.arrayOf(PropTypes.shape(SpaceListShape)),
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  pagintion: PropTypes.exact(PaginationShape),
  sortHandler: PropTypes.func,
  lockToggleHandler: PropTypes.func,
  setPageHandler: PropTypes.func,
}

Row.propTypes = {
  space: PropTypes.shape(SpaceListShape),
  lockToggleHandler: PropTypes.func,
}

PrivateCells.propTypes = {
  space: PropTypes.shape(SpaceShape),
}

SharedCells.propTypes = {
  space: PropTypes.shape(SpaceShape),
  hasPrivate: PropTypes.bool,
}

UserLink.propTypes = {
  user: PropTypes.shape(UserShape),
}

ToggleCell.propTypes = {
  space: PropTypes.shape(SpaceShape),
  lockToggleHandler: PropTypes.func,
}
