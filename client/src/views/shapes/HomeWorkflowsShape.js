import PropTypes from 'prop-types'


const HomeWorkflowsShape = {
  id: PropTypes.number,
  uid: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  location: PropTypes.string,
  addedBy: PropTypes.string,
  readme: PropTypes.string,
  createdAt: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  isOpen: PropTypes.bool,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
  featured: PropTypes.bool,
  revision: PropTypes.number,
}

const mapToHomeWorkflow = (data) => ({
  id: data.id,
  uid: data.uid,
  addedBy: data.added_by,
  createdAt: data.created_at_date_time,
  name: data.name,
  title: data.title,
  tags: data.tags,
  links: data.links,
  location: data.location,
  isChecked: data.isChecked,
  featured: data.featured,
  revision: data.revision,
  readme: data.readme,
})

export default HomeWorkflowsShape

export {
  HomeWorkflowsShape,
  mapToHomeWorkflow,
}
