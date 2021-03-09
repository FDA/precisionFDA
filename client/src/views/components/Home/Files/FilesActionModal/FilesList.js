import React from 'react'
import PropTypes from 'prop-types'

import { HomeFileShape } from '../../../../shapes/HomeFileShape'
import Icon from '../../../Icon'
import { HOME_FILES_ACTIONS } from '../../../../../constants'
import LinkTargetBlank from '../../../LinkTargetBlank'


const Item = ({ file, action }) => (
  <tr>
    {file.viewURL ?
      <>
        <td>
          <LinkTargetBlank url={file.viewURL}>
            {file.type === 'file' ?
              <Icon icon="fa-file-o" fw />
              :
              <Icon icon="fa-folder" fw />
            }
            <span>{file.name}</span>
          </LinkTargetBlank>
        </td>
        <td>
          <span className="objects-actions-modal__help-block">{file.fsPath}</span>
        </td>
      </>
    :
      <>
        <td>
          <Icon icon='fa-file-o' fw />
          <span>{file.name}</span>
        </td>
        <td>
          <a href={file.links.user} className='objects-actions-modal__help-block'>{file.createdBy}</a>
        </td>
      </> 
    }
    {(action === HOME_FILES_ACTIONS.DOWNLOAD) && (
      <td style={{ textAlign: 'center' }}>
        <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
          <Icon icon="fa-download" fw />&nbsp;
          download
        </a>
      </td>
    )}
  </tr>
)

const FilesList = ({ files = [], action }) => (
  <table className='table objects-actions-modal__table'>
    <tbody>
      {files.map((file) => <Item file={file} key={file.id} action={action} />)}
    </tbody>
  </table>
)

FilesList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(HomeFileShape)),
  action: PropTypes.string,
}

Item.propTypes = {
  file: PropTypes.exact(HomeFileShape),
  action: PropTypes.string,
}

export default FilesList
