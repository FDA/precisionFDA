import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import Icon from '../../Icon'
import { AccessibleSpaceShape } from '../../../shapes/AccessibleObjectsShape'
import { selectAccessibleSpace } from '../../../../actions/home'


const Item = ({ space, selectAccessibleSpace }) => {
  const classes = classNames({
    'accessible-spaces-table__item--selected': space.isSelected,
  }, 'accessible-spaces-table__item')

  return (
    <tr className={classes} onClick={() => selectAccessibleSpace(space.scope)}>
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

const SpacesList = ({ spaces, selectAccessibleSpace }) => {
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
        {spaces.map((space) => <Item space={space} key={space.scope} selectAccessibleSpace={selectAccessibleSpace}/> )}
      </tbody>
    </table>
  )
}

const mapDispatchToProps = (dispatch) => ({
  selectAccessibleSpace: (scope) => dispatch(selectAccessibleSpace(scope)),
})

export default connect(null, mapDispatchToProps)(SpacesList)

SpacesList.propTypes = {
  spaces: PropTypes.arrayOf(PropTypes.shape(AccessibleSpaceShape)),
  selectAccessibleSpace: PropTypes.func,
}

Item.propTypes = {
  space: PropTypes.shape(AccessibleSpaceShape),
  selectAccessibleSpace: PropTypes.func,
}
