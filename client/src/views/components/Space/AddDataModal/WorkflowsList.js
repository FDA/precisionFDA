import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import classNames from 'classnames/bind'

import { AccessibleWorkflowShape } from '../../../shapes/AccessibleObjectsShape'
import LinkTargetBlank from '../../LinkTargetBlank'
import Icon from '../../Icon'
import {
  toggleWorkflowsAddDataCheckbox,
  toggleAllWorkflowsAddDataCheckboxes,
} from '../../../../actions/spaces'


const Item = ({ workflow }) => {
  const dispatch = useDispatch()
  const toggleCheckbox = () => dispatch(toggleWorkflowsAddDataCheckbox(workflow.id))

  const checkboxClasses = classNames({
    'fa-square-o': !workflow.isChecked,
    'fa-check-square-o': workflow.isChecked,
  }, 'objects-actions-modal__checkbox')

  return (
    <tr>
      <td width={50}>
        <Icon icon={checkboxClasses} onClick={toggleCheckbox} />
      </td>
      <td>
        <LinkTargetBlank url={workflow.url}>
          <Icon icon="fa-bolt" fw />
          <span>{workflow.name}</span>
        </LinkTargetBlank>
      </td>
    </tr>
  )
}

const WorkflowsList = ({ workflows, isCheckedAll }) => {
  const dispatch = useDispatch()
  const toggleAll = () => dispatch(toggleAllWorkflowsAddDataCheckboxes())

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
        </tr>
      </thead>
      <tbody>
        {workflows.map((workflow) => <Item workflow={workflow} key={workflow.id} />)}
      </tbody>
    </table>
  )
}

export default WorkflowsList

WorkflowsList.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(AccessibleWorkflowShape)),
  isCheckedAll: PropTypes.bool,
}

Item.propTypes = {
  workflow: PropTypes.exact(AccessibleWorkflowShape),
}
