import React from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Icon from '../../../Icon'
import { AccessibleSpaceShape } from '../../../../shapes/AccessibleObjectsShape'
import { selectAccessibleSpace } from '../../../../../actions/spaces'


const Item = ({ space }) => {
  const dispatch = useDispatch()
  const selectSpace = () => dispatch(selectAccessibleSpace(space.scope))

  const classes = classNames({
    'accessible-spaces-table__item--selected': space.isSelected,
  }, 'accessible-spaces-table__item')

  return (
    <tr className={classes} onClick={selectSpace}>
      <td>
        <Icon icon="fa-object-group" />&nbsp;
        <span>{space.title}</span>
      </td>
      <td>
        <span className="objects-actions-modal__help-block">{space.scope}</span>
      </td>
      <td className="accessible-spaces-table__item-check-td">
        {(space.isSelected) && <Icon icon="fa-check-circle" />}
      </td>
    </tr>
  )
}

const SpacesList = ({ spaces }) => {
  const { spaceId } = useParams()
  spaces = spaces.filter((space) => space.scope !== `space-${spaceId}`)
  return (
    <table className="table objects-actions-modal__table accessible-spaces-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Scope</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {spaces.map((space) => <Item space={space} key={space.scope} />)}
      </tbody>
    </table>
  )
}

export default SpacesList

SpacesList.propTypes = {
  spaces: PropTypes.arrayOf(PropTypes.shape(AccessibleSpaceShape)),
}

Item.propTypes = {
  space: PropTypes.shape(AccessibleSpaceShape),
}
