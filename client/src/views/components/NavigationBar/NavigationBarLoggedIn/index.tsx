import React from 'react'
import classNames from 'classnames/bind'
import { withRouter, useLocation, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'
import { PFDALogoLight } from '../PFDALogo'
import { SUPPORT_EMAIL } from '../../../../constants'


// TODO: NavigationBarLoggedIn is WIP and not ready but will replace _navbar.html.erb in Rails eventually
//       To test this, enable it in NavigationBar/index.js via the showLoggedInNavBar flag
const NavigationBarLoggedIn = (user: any) => {
  const userCanAdministerSite = user.can_administer_site

  const pathname = useLocation().pathname
  const getLinkClassName = (linkPath: string) => {
    if (linkPath == '/') { // Special case
      return classNames({
        'active': pathname == linkPath,
      })
    }
    return classNames({
      'active': pathname.startsWith(linkPath),
    })
  }

  return (
    <nav className="pfda-navbar-loggedin">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#pfda-navbar-collapse" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <PFDALogoLight className="pfda-navbar-logo" />
      </div>
      <div className="collapse navbar-collapse" id="pfda-navbar-collapse">
        <ul className="nav-links nav navbar-nav">
          <li className={getLinkClassName('/')} role="presentation">
            <Link to={'/'}>
              <div className="nav-icon fa fa-2x fa-home"></div>
              <div className="nav-pill-title">Overview</div>
            </Link>
          </li>
          <li className={getLinkClassName('/discussions')} role="presentation">
            <a href={'/discussions'}>
              <div className="nav-icon fa fa-2x fa-comments-o"></div>
              <div className="nav-pill-title">Discussions</div>
            </a>
          </li>
          <li className={getLinkClassName('/challenges')} role="presentation">
            <Link to={'/challenges'}>
              <div className="nav-icon fa fa-2x fa-trophy"></div>
              <div className="nav-pill-title">Challenges</div>
            </Link>
          </li>
          <li className={getLinkClassName('/experts')} role="presentation">
            <Link to={'/experts'}>
              <div className="nav-icon fa fa-2x fa-star-o"></div>
              <div className="nav-pill-title">Experts</div>
            </Link>
          </li>
          <li className="nav-spacer"></li>
          <li className={getLinkClassName('/notes')} role="presentation">
            <a href={'/notes'}>
              <div className="nav-icon fa fa-2x fa-sticky-note"></div>
              <div className="nav-pill-title">Notes</div>
            </a>
          </li>
          <li className={getLinkClassName('/comparisons')} role="presentation">
            <a href={'/comparisons'}>
              <div className="nav-icon fa fa-2x fa-bullseye"></div>
              <div className="nav-pill-title">Comparisons</div>
            </a>
          </li>
          <li className="nav-spacer"></li>
          <li className={getLinkClassName('/home')} role="presentation">
            <Link to={'/home'}>
              <div className="nav-icon fa fa-2x fa-fort-awesome"></div>
              <div className="nav-pill-title">My Home</div>
            </Link>
          </li>
          {user.can_see_spaces && (
            <>
            <li className="nav-spacer"></li>
            <li className={getLinkClassName('/spaces')} role="presentation">
              <Link to={'/spaces'}>
                <div className="nav-icon fa fa-2x fa-object-group"></div>
                <div className="nav-pill-title">Spaces</div>
              </Link>
            </li>
            </>
          )}
        </ul>
        <ul className="nav navbar-nav navbar-right">
          <li role="presentation">
            <a href={"mailto: " + SUPPORT_EMAIL}>
              <div className="nav-icon fa fa-2x fa-commenting-o"></div>
              <div className="nav-pill-title">Support</div>
            </a>
          </li>
          <li role="presentation">
            <a href={"/docs"}>
              <div className="nav-icon fa fa-2x fa-question"></div>
              <div className="nav-pill-title">Get Started</div>
            </a>
          </li>
          <li className="dropdown">
            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              <div className="nav-icon fa fa-2x">
                <img className="img-circle" height="48px" alt="Profile page" src={user.gravatar_url} />
              </div>
              <div className="nav-pill-title">
                {user.full_name}&nbsp;<span className="caret"></span>
              </div>
            </a>
            <ul className="dropdown-menu">
              <li><a href="/profile">Profile</a></li>
              <li><a href={`/users/${user.dxuser}`}>Public Profile</a></li>
              <li><a href={`/licenses`}>Manage Licenses</a></li>
              {user.can_access_notification_preference && (
                <li><a href="#" data-toggle="modal" data-target="#notification_settings_modal">Notification Settings</a></li>
              )}
              <li role="separator" className="divider"></li>
              <li><a href="/about"><span className="fa fa-fw fa-info-circle"></span> About</a></li>
              <li><a href="/guidelines"><span className="fa fa-fw fa-institution"></span> Guidelines</a></li>
              <li><a href="/docs"><span className="fa fa-fw fa-book"></span> Docs</a></li>
              <li role="separator" className="divider"></li>
              {userCanAdministerSite && (
                <>
                <li><a href="/admin">Admin Dashboard</a></li>
                <li role="separator" className="divider"></li>
                </>
              )}
              <li><a href="/logout">Log out</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}

const mapStateToProps = (state: any) => ({
  user: contextUserSelector(state),
})

export {
  NavigationBarLoggedIn,
}

export default withRouter(connect(mapStateToProps, null)(NavigationBarLoggedIn))
