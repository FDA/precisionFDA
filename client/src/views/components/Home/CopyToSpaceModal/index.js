import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Button from '../../Button'
import Modal from '../../Modal'
import SpacesList from './SpacesList'
import { AccessibleSpaceShape } from '../../../shapes/AccessibleObjectsShape'
import { fetchAccessibleSpaces } from '../../../../actions/home'
import { homeAccessibleSpacesSelector } from '../../../../reducers/home/page/selectors'


const Footer = ({ hideAction, copyAction, isCopyDisabled }) => (
  <>
    <Button onClick={hideAction}>Cancel</Button>
    <Button type="primary" onClick={copyAction} disabled={isCopyDisabled}>Copy</Button>
  </>
)

const CopyToSpaceModal = (props) => {
  const { isOpen, hideAction, getAccessibleSpaces, title, spaces, ids, copyAction, isLoading } = props

  useEffect(() => {
    if (isOpen) getAccessibleSpaces()
  }, [isOpen])

  const selectedSpace = spaces.find((space) => space.isSelected)
  const selectedSpaceScope = selectedSpace ? selectedSpace.scope : null

  return (
    <div className="objects-actions-modal">
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        title={title}
        modalFooterContent={
          <Footer
            hideAction={hideAction}
            copyAction={() => copyAction(selectedSpaceScope, ids)}
            isCopyDisabled={!selectedSpaceScope}
          />}
        hideModalHandler={hideAction}
        noPadding
      >
        <div>
          <SpacesList spaces={spaces} />
        </div>
      </Modal>
    </div>
  )
}

CopyToSpaceModal.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.number),
  copyAction: PropTypes.func,
  getAccessibleSpaces: PropTypes.func,
  title: PropTypes.string,
  isLoading: PropTypes.bool,
  spaces: PropTypes.arrayOf(PropTypes.shape(AccessibleSpaceShape)),
  isOpen: PropTypes.bool,
  hideAction: PropTypes.func,
}

CopyToSpaceModal.defaultProps = {
  ids: [],
  copyAction: () => {},
  getAccessibleSpaces: () => {},
  title: 'Select Space',
  spaces: [],
  hideAction: () => {},
}

Footer.propTypes = {
  hideAction: PropTypes.func,
  copyAction: PropTypes.func,
  isCopyDisabled: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  spaces: homeAccessibleSpacesSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  getAccessibleSpaces: () => dispatch(fetchAccessibleSpaces()),
})

export default connect(mapStateToProps, mapDispatchToProps)(CopyToSpaceModal)

export {
  CopyToSpaceModal,
}
