import React from 'react'
import PropTypes from 'prop-types'

import Loader from '../Loader'
import './style.sass'


const ContainerLoader = ({ text }) =>
  <div className="pfda-container-loader">
    <div className="pfda-container-loader__container">
      {(text) && <div className="pfda-container-loader__text">{text}</div>}
      <div className="pfda-container-loader__loader">
        <Loader />
      </div>
    </div>
  </div>

ContainerLoader.propTypes = {
  text: PropTypes.string,
}

export default ContainerLoader
