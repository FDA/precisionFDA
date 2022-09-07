import PropTypes from 'prop-types'

import { FILES_TYPE_FOLDER } from '../../constants'


const FileActionItemShape = {
  id: PropTypes.number,
  fsPath: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  viewURL: PropTypes.string,
  downloadURL: PropTypes.string,
  addedBy: PropTypes.string,
  createdAtDateTime: PropTypes.string,
}

const mapToFileActionItem = (file) => ({
  id: file.id,
  fsPath: file.fsPath,
  name: file.name,
  type: file.type,
  viewURL: file.viewURL,
  downloadURL: file.downloadURL,
  addedBy: file.added_by,
  createdAtDateTime: file.created_at_date_time,
})

const FileShape = {
  id: PropTypes.number,
  uid: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  isFolder: PropTypes.bool,
  org: PropTypes.string,
  addedBy: PropTypes.string,
  size: PropTypes.string,
  origin: PropTypes.string,
  createdAtDateTime: PropTypes.string,
  created: PropTypes.string,
  state: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  links: PropTypes.object,
  isChecked: PropTypes.bool,
}

const mapToFile = (file) => ({
  id: file.id,
  uid: file.uid,
  name: file.name,
  type: file.type,
  isFolder: (file.type === FILES_TYPE_FOLDER),
  org: file.org,
  addedBy: file.added_by,
  size: file.file_size,
  origin: file.origin,
  created: file.created_at,
  createdAtDateTime: file.created_at_date_time,
  state: file.state,
  tags: file.tags || [],
  links: file.links,
  isChecked: false,
})

export default FileShape

export {
  FileShape,
  FileActionItemShape,
  mapToFile,
  mapToFileActionItem,
}
