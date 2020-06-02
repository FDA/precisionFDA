import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import classNames from 'classnames/bind'

import { AccessibleAppShape } from '../../../shapes/AccessibleObjectsShape'
import LinkTargetBlank from '../../LinkTargetBlank'
import Icon from '../../Icon'
import {
  toggleAppsAddDataCheckbox,
  toggleAllAppsAddDataCheckboxes,
} from '../../../../actions/spaces'


const Item = ({ app }) => {
  const dispatch = useDispatch()
  const toggleCheckbox = () => dispatch(toggleAppsAddDataCheckbox(app.id))

  const checkboxClasses = classNames({
    'fa-square-o': !app.isChecked,
    'fa-check-square-o': app.isChecked,
  }, 'objects-actions-modal__checkbox')

  return (
    <tr>
      <td width={50}>
        <Icon icon={checkboxClasses} onClick={toggleCheckbox} />
      </td>
      <td>
        <LinkTargetBlank url={app.url}>
          <Icon icon="fa-cube" fw />
          <span>{app.name}</span>
        </LinkTargetBlank>
      </td>
      <td>{app.revision}</td>
    </tr>
  )
}

const AppsList = ({ apps, isCheckedAll }) => {
  const dispatch = useDispatch()
  const toggleAll = () => dispatch(toggleAllAppsAddDataCheckboxes())

  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'objects-actions-modal__checkbox')

  return (
    <table className="table objects-actions-modal__table">
      <thead>
        <tr>
          <th width={50}>
            <Icon icon={checkboxClasses} onClick={toggleAll} />
          </th>
          <th>Title</th>
          <th>Revision</th>
        </tr>
      </thead>
      <tbody>
        {apps.map((app) => <Item app={app} key={app.id} />)}
      </tbody>
    </table>
  )
}

export default AppsList

AppsList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.exact(AccessibleAppShape)),
  isCheckedAll: PropTypes.bool,
}

Item.propTypes = {
  app: PropTypes.exact(AccessibleAppShape),
}
