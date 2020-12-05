import React from 'react'
import PropTypes from 'prop-types'

import DefaultLayout from '../DefaultLayout'
import Tabs from './Tabs'
import Menu from './Menu'

import './style.sass'


const HomeLayout = (props) => {
  return (
    <DefaultLayout>
      <div>
        <Tabs />
      </div>
      <div className="home-page-layout">
        <div className='home-page-layout__container'>
          <Menu />
          <div className="home-page-layout__content">
            <div className="pfda-padded-20">
              {props.children}
            </div>
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
}

export default HomeLayout