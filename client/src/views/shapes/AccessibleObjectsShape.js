import PropTypes from 'prop-types'


const AccessibleSpaceShape = {
  scope: PropTypes.string,
  title: PropTypes.string,
  isSelected: PropTypes.bool,
}

const mapToAccessibleSpace = (space) => ({
  scope: space.scope,
  title: space.title,
  isSelected: false,
})

const AccessibleFileShape = {
  id: PropTypes.number,
  uid: PropTypes.string,
  name: PropTypes.string,
  scope: PropTypes.string,
  url: PropTypes.string,
  isChecked: PropTypes.bool,
}

const mapToAccessibleFile = (file) => ({
  id: file.id,
  uid: file.uid,
  name: file.title || file.name,
  scope: file.scope,
  url: file.path,
  isChecked: false,
})

const AccessibleAppShape = {
  id: PropTypes.number,
  uid: PropTypes.string,
  name: PropTypes.string,
  url: PropTypes.string,
  revision: PropTypes.number,
  isChecked: PropTypes.bool,
}

const mapToAccessibleApp = (app) => ({
  id: app.id,
  uid: app.uid,
  name: app.title || app.name,
  url: app.path,
  revision: app.revision,
  isChecked: false,
})

const AccessibleWorkflowShape = {
  id: PropTypes.number,
  uid: PropTypes.string,
  name: PropTypes.string,
  url: PropTypes.string,
  isChecked: PropTypes.bool,
}

const mapToAccessibleWorkflow = (workflow) => ({
  id: workflow.id,
  uid: workflow.uid,
  name: workflow.name,
  url: workflow.path,
  isChecked: false,
})

export {
  AccessibleSpaceShape,
  AccessibleFileShape,
  AccessibleAppShape,
  AccessibleWorkflowShape,
  mapToAccessibleSpace,
  mapToAccessibleFile,
  mapToAccessibleApp,
  mapToAccessibleWorkflow,
}
