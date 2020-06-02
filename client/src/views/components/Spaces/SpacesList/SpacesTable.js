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
import { Table, Thead, Tbody, Th } from '../../TableComponents'
import Pagination from '../../TableComponents/Pagination'


const UserLink = ({ user }) => (
  <a href={user.url}>{user.name}</a>
)

const PrivateCells = ({ space }) => {
  const isAccessible = !!space.links.show
  const tdClasses = {
    'spaces-list-table__private-row': true,
    'td-underline': isAccessible,
  }
  return (
    <>
      <td className={classNames(tdClasses)}>
        { isAccessible ?
          <Link to={`/spaces/${space.id}`}>Private</Link> :
          <span>Private</span>
        }
      </td>
      <td className="spaces-list-table__private-row">
        {(space.hostLead) && <UserLink user={space.hostLead} />}
      </td>
      <td className="spaces-list-table__private-row"></td>
    </>
  )
}

const SharedCells = ({ space, hasPrivate }) => {
  const sharedRowspan = (hasPrivate) ? 1 : 2
  const isAccessible = !!space.links.show
  const tdClasses = {
    'spaces-list-table__shared-row': true,
    'td-underline': isAccessible,
  }
  return (
    <>
      <td className={classNames(tdClasses)} rowSpan={sharedRowspan}>
        { isAccessible ?
          <Link to={`/spaces/${space.id}`}>Shared</Link> :
          <span>Shared</span>
        }
      </td>
      <td className="spaces-list-table__shared-row" rowSpan={sharedRowspan}>
        {(space.hostLead) && <UserLink user={space.hostLead} />}
      </td>
      <td className="spaces-list-table__shared-row" rowSpan={sharedRowspan}>
        {(space.guestLead) && <UserLink user={space.guestLead} />}
      </td>
    </>
  )
}

const ToggleCell = ({ space, lockToggleHandler }) => {
  const classes = classNames(
    'spaces-list-table__switcher',
    `spaces-list-table__switcher--${space.status}`,
  )
  return (
    <td rowSpan="2" className="spaces-list-table__switcher-td">
      <div className={classes}>
        {(space.hasLockLink) && (
          <div>
            <ToggleSwitch space={space} vertical toggleHandler={lockToggleHandler} />
          </div>
        )}
        <div className="spaces-list-table__switcher-label">{space.status}</div>
      </div>
    </td>
  )
}

const Row = ({ space, lockToggleHandler }) => {
  const paddTrClasses = classNames('spaces-list-table__tr', 'spaces-list-table__tr--padding')
  const topTrClasses = classNames('spaces-list-table__tr', 'spaces-list-table__tr--top')
  const bottomTrClasses = classNames('spaces-list-table__tr', 'spaces-list-table__tr--bottom')
  return (
    <>
      <tr className={paddTrClasses}>
        <td colSpan="9" />
      </tr>
      <tr className={topTrClasses}>
        <ToggleCell space={space.shared} lockToggleHandler={lockToggleHandler} />
        <td className="spaces-list-table__title">
          { space.shared.links.show ?
            <Link to={`/spaces/${space.shared.id}`}>{space.shared.name}</Link> :
            <span>{space.shared.name}</span>
          }
        </td>
        <td>{space.shared.type}</td>
        <td rowSpan="2" className="spaces-list-table__tags">
          <TagsList tags={space.shared.tags} />
        </td>
        <td>{space.shared.createdAt}</td>
        <td>{space.shared.updatedAt}</td>
        {(space.hasPrivate) ? <PrivateCells space={space.private} /> : <SharedCells space={space.shared} />}
      </tr>
      <tr className={bottomTrClasses}>
        <td colSpan="2">{space.shared.desc}</td>
        <td colSpan="2"></td>
        {(space.hasPrivate) && <SharedCells space={space.shared} hasPrivate />}
      </tr>
    </>
  )
}

const SpacesTable = (props) => {
  const { spaces, sortType, sortDir, pagintion } = props
  const { sortHandler, lockToggleHandler, setPageHandler } = props

  return (
    <div className="spaces-list-table">
      <Table>
        <Thead>
          <Th>space state</Th>
          <Th sortType={sortType} sortDir={sortDir} type="name" sortHandler={sortHandler}>name</Th>
          <Th sortType={sortType} sortDir={sortDir} type="type" sortHandler={sortHandler}>type</Th>
          <Th>tags</Th>
          <Th sortType={sortType} sortDir={sortDir} type="created_at" sortHandler={sortHandler}>created on</Th>
          <Th sortType={sortType} sortDir={sortDir} type="updated_at" sortHandler={sortHandler}>modified on</Th>
          <Th>area type</Th>
          <Th>reviewer/host lead</Th>
          <Th>sponsor/guest lead</Th>
        </Thead>
        <Tbody>
          {spaces.map((space) => <Row space={space} key={space.id} lockToggleHandler={lockToggleHandler} />)}
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
