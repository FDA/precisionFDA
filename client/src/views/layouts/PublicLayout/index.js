import React from 'react'
import PropTypes from 'prop-types'

import AlertNotifications from '../../components/AlertNotifications'
import LoaderWrapper from '../../components/LoaderWrapper'


const PublicLayout = ({ children }) =>
  <>
    <LoaderWrapper>
      <div>
        {children}
        <AlertNotifications />
      </div>
    </LoaderWrapper>
  </>

export default PublicLayout

PublicLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
}
