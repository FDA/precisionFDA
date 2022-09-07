import PropTypes from 'prop-types'


const HomeDatabasesShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  addedByFullname: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  scopeName: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  engine: PropTypes.string,
  version: PropTypes.string,
  dxInstanceClass: PropTypes.string,
  status: PropTypes.string,
  links: PropTypes.object,
  statusUpdated: PropTypes.string,
  statusUpdatedDateTime: PropTypes.string,
  dxid: PropTypes.string,
  uid: PropTypes.string,
  host: PropTypes.string,
  port: PropTypes.string,
  isChecked: PropTypes.bool,
  showLicensePending: PropTypes.bool,
}

const mapToHomeDatabase = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  addedByFullname: data.added_by_fullname,
  createdAtDateTime: data.created_at_date_time,
  name: data.name,
  title: data.name,
  scopeName: data.scope,
  // scopeName: data.scope_name,
  description: data.description,
  tags: data.tags || [],
  engine: data.engine,
  version: data.engine_version,
  dxInstanceClass: data.dx_instance_class,
  status: data.status,
  links: data.links,
  statusUpdated: data.status_as_of,
  statusUpdatedDateTime: data.status_updated_date_time,
  dxid: data.dxid,
  uid: data.uid,
  host: data.host,
  port: data.port,
  isChecked: false,
  showLicensePending: data.show_license_pending,
})

export default HomeDatabasesShape

export {
  HomeDatabasesShape,
  mapToHomeDatabase,
}
