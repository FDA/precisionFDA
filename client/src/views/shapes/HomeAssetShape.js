import PropTypes from 'prop-types'


const HomeAssetShape = {
  id: PropTypes.number,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  location: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  links: PropTypes.object,
  uid: PropTypes.string,
  featured: PropTypes.bool,
  origin: PropTypes.object,
  description: PropTypes.string,
  archiveContent: PropTypes.arrayOf(PropTypes.string),
  fileLicense: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToHomeAsset = (data) => ({
  id: data.id,
  addedBy: data.added_by,
  createdAtDateTime: data.created_at_date_time,
  location: data.location,
  name: data.name,
  size: data.file_size,
  tags: data.tags || [],
  links: data.links,
  uid: data.uid,
  featured: data.featured,
  origin: data.origin,
  description: data.description,
  archiveContent: data.archive_content,
  fileLicense: data.file_license,
  isChecked: false,
})

export default HomeAssetShape

export {
  HomeAssetShape,
  mapToHomeAsset,
}
