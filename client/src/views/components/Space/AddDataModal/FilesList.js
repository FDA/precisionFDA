import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import classNames from 'classnames/bind'

import { AccessibleFileShape } from '../../../shapes/AccessibleObjectsShape'
import LinkTargetBlank from '../../LinkTargetBlank'
import Icon from '../../Icon'
import {
  toggleFilesAddDataCheckbox,
  toggleAllFilesAddDataCheckboxes,
} from '../../../../actions/spaces'


const Item = ({ file }) => {
  const dispatch = useDispatch()
  const toggleCheckbox = () => dispatch(toggleFilesAddDataCheckbox(file.id))

  const checkboxClasses = classNames({
    'fa-square-o': !file.isChecked,
    'fa-check-square-o': file.isChecked,
  }, 'objects-actions-modal__checkbox')

  return (
    <tr>
      <td width={50}>
        <Icon icon={checkboxClasses} onClick={toggleCheckbox} />
      </td>
      <td>
        <LinkTargetBlank url={file.url}>
          <Icon icon="fa-file-o" fw />
          <span>{file.name}</span>
        </LinkTargetBlank>
      </td>
      <td>{file.scope}</td>
    </tr>
  )
}

const FilesList = ({ files, isCheckedAll }) => {
  const dispatch = useDispatch()
  const toggleAll = () => dispatch(toggleAllFilesAddDataCheckboxes())

  const checkboxClasses = classNames({
    'fa-square-o': !isCheckedAll,
    'fa-check-square-o': isCheckedAll,
  }, 'objects-actions-modal__checkbox')

  return (
    <table className="table objects-actions-modal__table">
      <thead>
        <tr>
          <th width={50}>
            <Icon icon={checkboxClasses} onClick={toggleAll} />
          </th>
          <th>Title</th>
          <th>Scope</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => <Item file={file} key={file.id} />)}
      </tbody>
    </table>
  )
}

export default FilesList

FilesList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.exact(AccessibleFileShape)),
  isCheckedAll: PropTypes.bool,
}

Item.propTypes = {
  file: PropTypes.exact(AccessibleFileShape),
}
