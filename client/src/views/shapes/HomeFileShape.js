import PropTypes from 'prop-types'


const HomeFileShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  createdAt: PropTypes.string, 
  name: PropTypes.string,
  revision: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  links: PropTypes.object,
  isChecked: PropTypes.bool,
  scope: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
  state: PropTypes.string,
  origin: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  location: PropTypes.string,
  description: PropTypes.string,
  uid: PropTypes.string,
  featured: PropTypes.bool,
  fsPath: PropTypes.string,
  viewURL: PropTypes.string,
  downloadURL: PropTypes.string,
  fileLicense: PropTypes.object,
}

const mapToHomeFile = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAtDateTime: data.created_at_date_time,
  createdAt: data.created_at,
  name: data.name,
  tags: data.tags || [],
  isChecked: false,
  scope: data.scope,
  state: data.state,
  type: data.type,
  revision: data.revision,
  title: data.title,
  links: data.links,
  size: data.file_size,
  origin: data.origin,
  location: data.location,
  description: data.description,
  uid: data.uid,
  featured: data.featured,
  fileLicense: data.file_license,
})

export default HomeFileShape

export {
  HomeFileShape,
  mapToHomeFile,
}
