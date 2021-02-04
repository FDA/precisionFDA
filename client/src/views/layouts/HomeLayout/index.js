import React from 'react'
import PropTypes from 'prop-types'

import DefaultLayout from '../DefaultLayout'
import Tabs from './Tabs'
import Menu from './Menu'

import './style.sass'


const HomeLayout = ({ children, hideTabs }) => {
  return (
    <DefaultLayout>
      <div className="home-page-layout pfda-margin-t-20">
        <div className='home-page-layout__container'>
          <Menu />
          <div className="home-page-layout__content">
            {!hideTabs &&
              <div>
                <Tabs />
              </div>
            }
            <div className="pfda-padded-20">
              {children}
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
  hideTabs: PropTypes.bool,
}

export default HomeLayout
