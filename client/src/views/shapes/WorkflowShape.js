import PropTypes from 'prop-types'


const WorkflowShape = {
  id: PropTypes.number,
  name: PropTypes.string,
  location: PropTypes.string,
  addedBy: PropTypes.string,
  createdAt: PropTypes.string,
  scope: PropTypes.string,
  links: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.string),
  isChecked: PropTypes.bool,
  featured: PropTypes.bool,
}

const mapToWorkflow = (data) => ({
  id: data.id,
  name: data.name,
  location: data.location,
  addedBy: data.added_by,
  createdAt: data.created_at,
  tags: data.tags || [],
  scope: data.scope,
  links: data.links,
  isChecked: false,
})

export default WorkflowShape

export {
  WorkflowShape,
  mapToWorkflow,
}
