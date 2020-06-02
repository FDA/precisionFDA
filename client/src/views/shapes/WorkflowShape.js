import PropTypes from 'prop-types'


const WorkflowShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  addedBy: PropTypes.string,
  createdAt: PropTypes.string,
  scope: PropTypes.string,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToWorkflow = (data) => ({
  id: data.id,
  name: data.name,
  addedBy: data.added_by,
  createdAt: data.created_at,
  scope: data.scope,
  links: data.links,
  isChecked: false,
})

export default WorkflowShape

export {
  WorkflowShape,
  mapToWorkflow,
}
