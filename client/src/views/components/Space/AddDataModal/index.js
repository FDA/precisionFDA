import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import capitalize from 'capitalize'

import SpaceShape from '../../../shapes/SpaceShape'
import Button from '../../Button'
import Modal from '../../Modal'
import {
  spaceAddDataModalSelector,
  spaceAccessibleAppsSelector,
  spaceAccessibleWorkflowsSelector,
} from '../../../../reducers/spaces/space/selectors'
import {
  hideSpaceAddDataModal,
  fetchAccessibleApps,
  fetchAccessibleWorkflows,
  addDataToSpace,
} from '../../../../actions/spaces'
import { SPACE_ADD_DATA_TYPES } from '../../../../constants'
import {
  AccessibleWorkflowShape,
  AccessibleFileShape,
  AccessibleAppShape,
} from '../../../shapes/AccessibleObjectsShape'
import AppsList from './AppsList'
import WorkflowsList from './WorkflowsList'
import FileTree from '../Files/FileTree'
import { spaceFileTreeSelector } from './selectors'
import { fetchNodes } from './actions'


const getObjectsFetcher = (type) => {
  switch (type) {
    case SPACE_ADD_DATA_TYPES.APPS:
      return fetchAccessibleApps
    case SPACE_ADD_DATA_TYPES.WORKFLOWS:
      return fetchAccessibleWorkflows
    default:
      return () => { }
  }
}

const DataList = ({ modal, apps, workflows }) => {
  switch (modal.dataType) {
    case SPACE_ADD_DATA_TYPES.APPS:
      return <AppsList apps={apps} isCheckedAll={modal.isCheckedAll} />
    case SPACE_ADD_DATA_TYPES.WORKFLOWS:
      return <WorkflowsList workflows={workflows} isCheckedAll={modal.isCheckedAll} />
    default:
      return <span>No Data</span>
  }
}

const Footer = ({ hideAction, addDataAction, disabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" disabled={disabled} onClick={addDataAction}>Select</Button>
  </>
)

const AddDataModal = ({ space, folderId, loadDataHandler }) => {
  const modal = useSelector(spaceAddDataModalSelector)
  const [files, setFiles] = useState([])
  const apps = useSelector(spaceAccessibleAppsSelector)
  const workflows = useSelector(spaceAccessibleWorkflowsSelector)
  const dispatch = useDispatch()
  const hideAction = () => dispatch(hideSpaceAddDataModal())

  useEffect(() => {
    if (modal.isOpen && modal.dataType !== SPACE_ADD_DATA_TYPES.FILES) {
      const fetchAction = getObjectsFetcher(modal.dataType)
      dispatch(fetchAction())
    }
  }, [modal.isOpen, modal.dataType])

  const MAX_OBJECTS = 20

  let checkedObjects

  if (modal.dataType === SPACE_ADD_DATA_TYPES.FILES) {
    checkedObjects = [...files]
  } else {
    checkedObjects = [...apps, ...workflows].filter((object => object.isChecked)).map(node => node.uid)
  }

  const disabled = !checkedObjects.length || checkedObjects.length > MAX_OBJECTS
  const areaType = (space.isPrivate) ? 'private' : 'shared'
  const dataType = (modal.dataType) ? modal.dataType.toLowerCase() : ''
  const title = capitalize.words(`Add ${dataType} to ${areaType} space`)
  const subTitle = `Only private ${dataType} can be added or uploaded to a ${areaType} space. ${capitalize(dataType)} in an space area can be published, but cannot be made private
again. You can select only 20 objects at the same time. ${checkedObjects.length} object(s) selected.`

  const addDataAction = () => {
    if (!disabled) {
      return dispatch(addDataToSpace(checkedObjects, folderId)).then((statusIsOk) => {
        if (statusIsOk && loadDataHandler) loadDataHandler()
      })
    }
  }

  const nodes = useSelector(spaceFileTreeSelector).nodes

  const loadNodes = (node) => dispatch(fetchNodes(node.key))

  const onFileCheck = (checkedKeys) => {
    setFiles(checkedKeys)
  }

  return (
    <Modal
      isOpen={modal.isOpen}
      isLoading={modal.isLoading}
      title={title}
      subTitle={subTitle}
      modalFooterContent={<Footer hideAction={hideAction} addDataAction={addDataAction} disabled={disabled} />}
      hideModalHandler={hideAction}
      noPadding
    >
      { modal.dataType === SPACE_ADD_DATA_TYPES.FILES ?
        <FileTree loadData={loadNodes}
                  treeData={nodes}
                  checkable={true}
                  onCheck={onFileCheck} /> :
        <DataList
          modal={modal}
          files={files}
          apps={apps}
          workflows={workflows}
        />
      }
    </Modal>
  )
}

export default AddDataModal

AddDataModal.propTypes = {
  space: PropTypes.shape(SpaceShape),
  folderId: PropTypes.any,
  loadDataHandler: PropTypes.func,
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  addDataAction: PropTypes.func,
  disabled: PropTypes.bool,
}

DataList.propTypes = {
  modal: PropTypes.object,
  files: PropTypes.arrayOf(PropTypes.exact(AccessibleFileShape)),
  apps: PropTypes.arrayOf(PropTypes.exact(AccessibleAppShape)),
  workflows: PropTypes.arrayOf(PropTypes.exact(AccessibleWorkflowShape)),
}
