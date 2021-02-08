import React from 'react'
import PropTypes from 'prop-types'

import { HomeWorkflowsShape } from '../../../../shapes/HomeWorkflowsShape'
import Icon from '../../../Icon'


const Item = ({ workflow }) => (
  <tr>
    <td>
      <Icon icon='fa-workflow-o' fw />
      <span>{workflow.name}</span>
    </td>
  </tr>
)

const WorkflowsList = ({ workflows = []}) => (
  <table className='table objects-actions-modal__table'>
    <tbody>
      {workflows.map((workflow) => <Item workflow={workflow} key={workflow.id}/>)}
    </tbody>
  </table>
)

WorkflowsList.propTypes = {
  workflows: PropTypes.arrayOf(PropTypes.exact(HomeWorkflowsShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  workflow: PropTypes.exact(HomeWorkflowsShape),
  action: PropTypes.string,
}

export default WorkflowsList
