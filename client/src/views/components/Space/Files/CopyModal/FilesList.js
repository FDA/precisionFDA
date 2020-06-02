import React from 'react'
import PropTypes from 'prop-types'

import { FileActionItemShape } from '../../../../shapes/FileShape'
import LinkTargetBlank from '../../../LinkTargetBlank'
import Icon from '../../../Icon'


const Item = ({ file }) => (
  <tr>
    <td>
      <LinkTargetBlank url={file.viewURL}>
        <Icon icon="fa-file-o" fw />
        <span>{file.name}</span>
      </LinkTargetBlank>
    </td>
    <td>
      <span className="objects-actions-modal__help-block">{file.fsPath}</span>
    </td>
  </tr>
)

const FilesList = ({ files }) => (
  <table className="table objects-actions-modal__table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Path</th>
      </tr>
    </thead>
    <tbody>
      {files.map((file) => <Item file={file} key={file.id} />)}
    </tbody>
  </table>
)

export default FilesList

FilesList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(FileActionItemShape)),
}

Item.propTypes = {
  file: PropTypes.exact(FileActionItemShape),
}
