import React from 'react'
import PropTypes from 'prop-types'

import HomeFileShape from '../../../shapes/HomeFileShape'
import LinkTargetBlank from '../../LinkTargetBlank'
import Icon from '../../Icon'
import { SPACE_FILES_ACTIONS } from '../../../../constants'


const Item = ({ file, action }) => (
  <tr>
    <td>
      <LinkTargetBlank url={file.links.show}>
        <Icon icon="fa-file-o" fw />&nbsp;
        <span>{file.name}</span>
      </LinkTargetBlank>
    </td>
    <td>
      <span className="objects-actions-modal__help-block">{file.fsPath}</span>
    </td>
    {(action === SPACE_FILES_ACTIONS.DOWNLOAD) && (
      <td>
        <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
          <Icon icon="fa-download" fw />&nbsp;
          download
        </a>
      </td>
    )}
    {(action === SPACE_FILES_ACTIONS.OPEN) && (
      <td>
        <a href={`${file.downloadURL}?inline=true`} target="_blank" rel="noopener noreferrer">
          <Icon icon="fa-file-o" fw />&nbsp;
          open
        </a>
      </td>
    )}
  </tr>
)

const FilesList = ({ files, action }) => (
  <table className="table objects-actions-modal__table">
    <tbody>
      {files.map((file) => <Item file={file} action={action} key={file.id} />)}
    </tbody>
  </table>
)

export default FilesList

FilesList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  file: PropTypes.exact(HomeFileShape),
  action: PropTypes.string,
}
