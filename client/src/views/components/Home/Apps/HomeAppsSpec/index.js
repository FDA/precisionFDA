import React from 'react'
import PropTypes from 'prop-types'

import SpecTable from './SpecTable'

import './style.sass'


const HomeAppsSpec = ({ spec = {}}) => {
  const internetAccess = spec.internet_access ? 'Yes' : 'No'

  return (
    <div className='home-app-spec__container'>
      <div className='home-app-spec__header'>
        <div className='home-app-spec__header_item'>
          <div className='home-app-spec__header_item_label'>default instance type</div>
          <div className='home-app-spec__header_item_value'>{spec.instance_type}</div>
        </div>
        <div className='home-app-spec__header_item'>
          <div className='home-app-spec__header_item_label'>has internet access</div>
          <div className='home-app-spec__header_item_value'>{internetAccess}</div>
        </div>
      </div>
      <div className='home-app-spec__table-container'>
        <SpecTable title='inputs' config={spec.input_spec} />
        <SpecTable title='outputs' config={spec.output_spec} />
      </div>
    </div>
  )
}

HomeAppsSpec.propTypes = {
  spec: PropTypes.object,
}

export default HomeAppsSpec

export {
  HomeAppsSpec,
}
