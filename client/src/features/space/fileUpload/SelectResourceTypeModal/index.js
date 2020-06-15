import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

import Modal from '../../../../views/components/Modal'
import SpaceTypeSwitch from '../../../../views/components/Spaces/SpaceTypeSwitch'
import { RESOURCE_TYPE } from '../constants'
import { resourceTypeModalShownSelector, resourceTypeSelector } from '../selectors'
import { hideSelectResourceTypeModal, setResourceType, showUploadModal } from '../actions'
import Button from '../../../../views/components/Button'
import { showSpaceAddDataModal } from '../../../../actions/spaces'
import { SPACE_ADD_DATA_TYPES } from '../../../../constants'
import { spaceDataSelector } from '../../../../reducers/spaces/space/selectors'
import './style.sass'


const RESOURCES_MAP = {
  [RESOURCE_TYPE.COPY]: {
    label: 'Copy data already on precisionFDA',
    description: 'This includes files, apps, workflows, and jobs',
  },
  [RESOURCE_TYPE.UPLOAD]: {
    label: 'Upload files',
    description: <div>
      Only files can be uploaded from your computer.
      <p>
        Apps, workflows, and jobs cannot be uploaded. These data types must be created
        in precisionFDA and copied into an area.
      </p>
    </div>,
  },
}

const Footer = ({ dispatch, resourceType }) => (
  <div>
    <Button type="default" onClick={() => dispatch(hideSelectResourceTypeModal())}>Cancel</Button>
    <Button type="primary" onClick={() => {
      dispatch(hideSelectResourceTypeModal())

      if (resourceType === RESOURCE_TYPE.COPY) {
        dispatch(showSpaceAddDataModal(SPACE_ADD_DATA_TYPES.FILES))
      } else if (resourceType === RESOURCE_TYPE.UPLOAD) {
        dispatch(showUploadModal())
      }
    }}>Select</Button>
  </div>
)

Footer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  resourceType: PropTypes.string.isRequired,
}

const SelectResourceTypeModal = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector(resourceTypeModalShownSelector)
  const resourceType = useSelector(resourceTypeSelector)
  const space = useSelector(spaceDataSelector)

  return(
    <Modal
      className="resource_type__modal"
      modalFooterContent={<Footer dispatch={dispatch} resourceType={resourceType}/>}
      isOpen={isOpen}
      title={`Add files to ${space.isPrivate ? 'Private' : 'Shared'} Area`}
      hideModalHandler={() => dispatch(hideSelectResourceTypeModal())}
    >
      <p className="resource_type__text">How would you like to add files?</p>
      <div className="resource_type__container">
        {
          Object.entries(RESOURCES_MAP).map(data => {
            const key = data[0]
            const info = data[1]

            return <SpaceTypeSwitch
                checked={key === resourceType}
                key={key}
                label={info.label}
                name={key}
                value={key}
                description={info.description}
                onChange={(e) => dispatch(setResourceType(e.currentTarget.value))}
              />
            },
          )
        }
      </div>
    </Modal>
  )
}

export default SelectResourceTypeModal
