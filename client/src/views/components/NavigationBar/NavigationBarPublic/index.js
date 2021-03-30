import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { withRouter, useLocation, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import precisionFDALight from './precisionFDA.white.png'
import precisionFDADark from './precisionFDA.dark.png'
import pfdaNavbarBackground from './pfdaNavbarBackground.png'
import './style.sass'
import Button from '../../Button'
import { contextSelector, contextUserSelector } from '../../../../reducers/context/selectors'


const NavigationBarPublic = ({ children, title, subtitle, showLogoOnNavbar, user }) => {

  const isLoggedIn = user && Object.keys(user).length > 0

  const onRequestAccess = () => {
    window.location.assign('/request_access')
  }

  const onLogIn = () => {
    window.location.assign('/login')
  }

  const showLogoAboveTitle = !isLoggedIn  // When user is logged in, the title is embedded in the navbar instead of above the title
  const showSocialMediaButtons = !children  // Show social media buttons unless there's a custom header like in ChallengesDetailsPage
  const showSocialMediaButtonText = useLocation().pathname == '/'

  const renderTitleIfDefined = () => {
    if (title != undefined) {
      return (
        <div className="navigation-bar-public-banner">
          <div className="navigation-bar-public-logo-and-title">
            {showLogoAboveTitle ? <img className="pfda-navbar-logo" src={precisionFDALight} /> : <div className="pfda-navbar-logo logo-img logo-img-none" />}
            <h1>{title}</h1>
          </div>
          <div className="navigation-bar-public-subtitle">
            <h2>{subtitle}</h2>
          </div>
          {showSocialMediaButtons &&
            <div className="navigation-bar-public-social-media-buttons">
              <a href="mailto:precisionfda@fda.hhs.gov" className="fa fa-envelope">{showSocialMediaButtonText ? 'Email the team' : ''}</a>
              <a href="https://twitter.com/precisionfda" className="fa fa-twitter">{showSocialMediaButtonText ? 'Twitter' : ''}</a>
              <a href="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin">{showSocialMediaButtonText ? 'LinkedIn' : ''}</a>
            </div>
          }
        </div>
      )
    }
    return ''
  }

  const pathname = useLocation().pathname
  const getLinkClassName = (linkPath) => {
    return classNames({
      'current': pathname.startsWith(linkPath),
    })
  }

  // Set up the sticky header
  useEffect(() => {
    const header = document.getElementById('pfda-navbar')
    const entireNavigationBar = document.getElementById('navigation-bar-public')
    if (!header || !entireNavigationBar) {
      return
    }

    const stickyPosition = entireNavigationBar.clientHeight
    const scrollCallBack = window.addEventListener('scroll', () => {
      if (window.pageYOffset > stickyPosition) {
        header.classList.add('sticky')
      } else {
        header.classList.remove('sticky')
      }
    })
    return () => {
      window.removeEventListener('scroll', scrollCallBack)
    }
  }, [])

  return (
    <div className="navigation-bar-public" id="navigation-bar-public" style={{ backgroundImage: `url(${pfdaNavbarBackground})` }}>
      {!isLoggedIn && (
        <div className="pfda-navbar-wrapper">
          <nav id="pfda-navbar">
            {showLogoOnNavbar ? <img className="pfda-navbar-logo logo-img logo-img-light" src={precisionFDALight} /> : <div className="pfda-navbar-logo logo-img logo-img-none" />}
            <img className="pfda-navbar-logo logo-img logo-img-dark" src={precisionFDADark} />
            <div className="center-buttons">
              <a href="/">Overview</a>
              <Link to={'/new_challenges'} className={getLinkClassName('/new_challenges')}>Challenges</Link>
              <a className={getLinkClassName('/experts')} href='/experts'>Experts</a>
              <Link to={'/news'} className={getLinkClassName('/news')}>News</Link>
              <a className={getLinkClassName('/about')} href='/about'>About</a>
            </div>
            <div className="right-buttons">
              <Button onClick={onRequestAccess}>Request Access</Button>
              <Button type="primary" onClick={onLogIn}>Log In</Button>
            </div>
          </nav>
        </div>
      )}
      {renderTitleIfDefined()}
      {children}
    </div>
  )
}


NavigationBarPublic.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showLogoOnNavbar: PropTypes.bool,
  showSocialMediaButtons: PropTypes.bool,
  context: PropTypes.object,
  user: PropTypes.object,
}

const mapStateToProps = state => ({
  context: contextSelector(state),
  user: contextUserSelector(state),
})

export {
  NavigationBarPublic,
}

export default withRouter(connect(mapStateToProps, null)(NavigationBarPublic))
