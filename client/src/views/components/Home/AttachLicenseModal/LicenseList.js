import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import Icon from '../../Icon'
import { AccessibleLicenseShape } from '../../../shapes/AccessibleObjectsShape'
import { selectAccessibleLicense } from '../../../../actions/home'

import './style.sass'


const Item = ({ license, selectAccessibleLicense, disable }) => {
  const classes = classNames({
    'accessible-spaces-table__item--selected': license.isSelected,
    'home-attach-license-modal__item--disabled': disable,
  }, 'accessible-spaces-table__item')

  const onItemClick = () => {
    if (!disable) selectAccessibleLicense(license.id)
  }

  return (
    <tr className={classes} onClick={onItemClick}>
      <td>
        {disable && <Icon icon="fa-check" />}&nbsp;
        <span>{license.title}</span>
      </td>
      <td className="accessible-spaces-table__item-check-td">
        {(license.isSelected) && <Icon icon="fa-check-circle" />}
      </td>
    </tr>
  )
}

const LicenseList = ({ licenses, selectAccessibleLicense, objectLicense }) => {
  return (
    <table className="table objects-actions-modal__table accessible-spaces-table">
      <thead>
        <tr>
          <th>Title</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {licenses.map((license) => (
          <Item
            license={license}
            key={license.id}
            selectAccessibleLicense={selectAccessibleLicense}
            disable={license.id === objectLicense.id}
          />
        ))}
      </tbody>
    </table>
  )
}

const mapDispatchToProps = (dispatch) => ({
  selectAccessibleLicense: (id) => dispatch(selectAccessibleLicense(id)),
})

export default connect(null, mapDispatchToProps)(LicenseList)

LicenseList.propTypes = {
  licenses: PropTypes.arrayOf(PropTypes.shape(AccessibleLicenseShape)),
  selectAccessibleLicense: PropTypes.func,
  objectLicense: PropTypes.object,
}

Item.propTypes = {
  license: PropTypes.shape(AccessibleLicenseShape),
  selectAccessibleLicense: PropTypes.func,
  disable: PropTypes.bool,
}
