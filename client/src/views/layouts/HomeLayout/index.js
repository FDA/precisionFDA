import React from 'react'
import PropTypes from 'prop-types'

import DefaultLayout from '../DefaultLayout'
import Menu from './Menu'

import './style.sass'


const HomeLayout = ({ children }) => {
  return (
    <DefaultLayout>
      <div className='home-page-layout home-page-layout__container'>
        <Menu />
        <div className="home-page-layout__content">
          <div className="pfda-padded-20">
            {children}
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

HomeLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
  hideTabs: PropTypes.bool,
}

export default HomeLayout
