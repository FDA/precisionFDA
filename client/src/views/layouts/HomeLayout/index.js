import React from 'react'
import PropTypes from 'prop-types'

import DefaultLayout from '../DefaultLayout'
import Tabs from './Tabs'
import Menu from './Menu'

import './style.sass'


<<<<<<< HEAD
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
=======
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
>>>>>>> production
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
<<<<<<< HEAD
  hideTabs: PropTypes.bool,
}

export default HomeLayout
=======
}

export default HomeLayout
>>>>>>> production
