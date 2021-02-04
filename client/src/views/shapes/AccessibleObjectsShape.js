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

const AccessibleLicenseShape = {
  added_by: PropTypes.string,
  added_by_fullname: PropTypes.string,
  approval_required: PropTypes.bool,
  content: PropTypes.string,
  created_at: PropTypes.string,
  created_at_date_time: PropTypes.string,
  id: PropTypes.number,
  location: PropTypes.string,
  tags: PropTypes.array,
  title: PropTypes.string,
  isSelected: PropTypes.bool,
}

const mapToAccessibleLicense = (license) => ({
  added_by: license.added_by,
  added_by_fullname: license.added_by_fullname,
  approval_required: license.approval_required,
  content: license.content,
  created_at: license.created_at,
  created_at_date_time: license.created_at_date_time,
  id: license.id,
  location: license.location,
  tags: license.tags,
  title: license.title,
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
  AccessibleLicenseShape,
  mapToAccessibleSpace,
  mapToAccessibleFile,
  mapToAccessibleApp,
  mapToAccessibleWorkflow,
  mapToAccessibleLicense,
}
