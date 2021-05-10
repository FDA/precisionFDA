import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import { withRouter, useLocation, Link } from 'react-router-dom'

import './style.sass'
import Button from '../../Button'
import ExternalLink from '../../Controls/ExternalLink'
import { NavigationBarLoggedIn } from '../NavigationBarLoggedIn'
import { PFDALogoLight, PFDALogoDark } from '../PFDALogo'


const NavigationBar = ({ children, title, subtitle, showLogoOnNavbar, user }) => {

  const isLoggedIn = user && Object.keys(user).length > 0

  const onRequestAccess = () => {
    window.location.assign('/request_access')
  }

  const onLogIn = () => {
    window.location.assign('/login')
  }

  const showLogoAboveTitle = !isLoggedIn  // When user is logged in, the title is embedded in the navbar instead of above the title
  const showSocialMediaButtons = !children  // Show social media buttons unless there's a custom header like in ChallengesDetailsPage
  // Displaying button text for social media button only happens in the landing page for a logged in user
  //   In this scenario we don't render the subtitle block in order to get the correct layout
  //   as the design does not include a title nor subtitle in this scenario
  const showSocialMediaButtonText = isLoggedIn && (useLocation().pathname == '/')

  const socialMediaButtonsContainerClasses = classNames({
    'navigation-bar-social-media-buttons-with-text': showSocialMediaButtonText,
    'navigation-bar-social-media-buttons': !showSocialMediaButtonText,
  })

  const renderTitleIfDefined = () => {
    if (title != undefined || subtitle != undefined || showSocialMediaButtonText) {
      return (
        <div className="navigation-bar-banner">
          <div className="navigation-bar-logo-and-title">
            {showLogoAboveTitle ? <PFDALogoLight className="pfda-navbar-logo" /> : <div className="pfda-navbar-logo logo-img logo-img-none" />}
            <h1>{title}</h1>
          </div>
          {!showSocialMediaButtonText &&
            <div className="navigation-bar-subtitle">
              <h2>{subtitle}</h2>
            </div>
          }
          {showSocialMediaButtons &&
            <div className={socialMediaButtonsContainerClasses}>
              <a href="mailto:precisionfda@fda.hhs.gov" className="fa fa-envelope">&nbsp;{showSocialMediaButtonText ? 'Email the team' : ''}</a>
              <ExternalLink to="https://twitter.com/precisionfda" className="fa fa-twitter">&nbsp;{showSocialMediaButtonText ? 'Twitter' : ''}</ExternalLink>
              <ExternalLink to="https://www.linkedin.com/showcase/precisionfda" className="fa fa-linkedin">&nbsp;{showSocialMediaButtonText ? 'LinkedIn' : ''}</ExternalLink>
            </div>
          }
        </div>
      )
    }
    return ''
  }

  const pathname = useLocation().pathname
  const getLinkClassName = (linkPath) => {
    if (linkPath == '/') { // Special case
      return classNames({
        'current': pathname == linkPath,
      })
    }
    return classNames({
      'current': pathname.startsWith(linkPath),
    })
  }

  // TODO: NavigationBarLoggedIn is WIP and not ready but will replace _navbar.html.erb in Rails eventually
  const showLoggedInNavBar = isLoggedIn && false

  // Set up the sticky header
  useEffect(() => {
    const header = document.getElementById('pfda-navbar')
    const entireNavigationBar = document.getElementById('navigation-bar')
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
    <div className="navigation-bar" id="navigation-bar" style={{ backgroundImage: `url("/assets/navbar/NavbarBackground.png")` }}>
      {showLoggedInNavBar && (
        <NavigationBarLoggedIn />
      )}
      {!isLoggedIn && (
        <div className="pfda-navbar-wrapper">
          <nav id="pfda-navbar">
            {showLogoOnNavbar ? <PFDALogoLight className="pfda-navbar-logo logo-img logo-img-light" /> : <div className="pfda-navbar-logo logo-img logo-img-none" />}
            <PFDALogoDark className="pfda-navbar-logo logo-img logo-img-dark" />
            <div className="center-buttons">
              <Link to={'/'} className={getLinkClassName('/')}>Overview</Link>
              <Link to={'/challenges'} className={getLinkClassName('/challenges')}>Challenges</Link>
              <Link to={'/news'} className={getLinkClassName('/news')}>News</Link>
              <Link to={'/experts'} className={getLinkClassName('/experts')}>Experts</Link>
              <Link to={'/about'} className={getLinkClassName('/about')}>About</Link>
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


NavigationBar.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  user: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  showLogoOnNavbar: PropTypes.bool,
  showSocialMediaButtons: PropTypes.bool,
}

export {
  NavigationBar,
}

export default withRouter(NavigationBar)
