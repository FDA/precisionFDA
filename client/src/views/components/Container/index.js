import React from 'react'
import PropTypes from 'prop-types'

import './style.sass'


const Container = ({ children }) =>
  <div className="pfda-spa-container">{children}</div>

Container.propTypes = {
  children: PropTypes.element.isRequired,
}

export default Container
