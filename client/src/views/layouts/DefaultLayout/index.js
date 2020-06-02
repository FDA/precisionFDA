import React from 'react'
import PropTypes from 'prop-types'

import Container from '../../components/Container'
import LoaderWrapper from '../../components/LoaderWrapper'
import AlertNotifications from '../../components/AlertNotifications'


const DefaultLayout = ({ children }) =>
  <>
    <LoaderWrapper>
      <Container>
          <div className="pfda-padded-t20">
            {children}
          </div>
      </Container>
    </LoaderWrapper>
    <AlertNotifications />
  </>

export default DefaultLayout

DefaultLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
}
