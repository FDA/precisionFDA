import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import styled, { css } from 'styled-components'
import classNames from 'classnames/bind'

import { PFDALogoLight, PFDALogoDark } from '../PFDALogo'
import { theme } from '../../../../styles/theme'
import Button from '../../Button'


type StyledPublicNavbarProps = {
  isSticky?: boolean,
}

const StyledPublicNavbar = styled.nav<StyledPublicNavbarProps>`
  display: flex;
  height: ${theme.sizing.navigationBarHeight};
  text-align: center;
  vertical-align: middle;
  transition: all .18s ease-in-out;

  nav > * {
    vertical-align: middle;
  }

  .logo-img {
    display: inline-block;
    text-align: left;
    margin: auto;
    margin-left: ${theme.padding.mainContentHorizontal};
  }

  .logo-img-dark {
    display: none;
  }

  .pfda-navbar-logo {
    width: 180px;
    height: 40px;
  }

  @media (max-width: 640px) {
    flex-flow: column wrap;
    overflow: scroll;
  }

  ${props => props.isSticky ? `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: ${theme.colors.subtleBlue};
    border-bottom: 1px solid ${theme.colors.borderDefault};
    z-index: 20;
  ` : ''}
`

type StyledPFDALogoProps = {
  hidden?: boolean,
}

const pfdaLogoStyle = css`
  display: inline-block;
  text-align: left;
  margin: auto;
  margin-left: ${theme.padding.mainContentHorizontal};
  width: 180px;
  height: 40px;
`

const StyledPFDALogoLight = styled(PFDALogoLight)<StyledPFDALogoProps>`
  ${pfdaLogoStyle};
  ${props => props.hidden ? `
  visibility: hidden;
  ` : ''}
`

const StyledPFDALogoDark = styled(PFDALogoDark)`
  ${pfdaLogoStyle};
`
const PublicNavbarCenterButtons = styled.div<StyledPublicNavbarProps>`
  display: inline-block;
  text-align: center;
  margin: auto;

  a {
    text-align: center;
    font-size: 13px;
    font-weight: 400;
    margin: 0.5em 1.25em;
    padding: 0.15em 0em;
    text-decoration: none;
    ${props => props.isSticky ? `
    color: ${theme.colors.textBlack};
    ` : `
    color: white;
    `}

    &:hover {
      ${props => props.isSticky ? `
      border-bottom: 2px solid black;
      ` : `
      border-bottom: 2px solid white;
      `}
    }
  }

  a.current {
    
    color: ${theme.colors.blueOnWhite};
    border-bottom: 2px solid ${theme.colors.blueOnWhite};

    ${props => props.isSticky ? `
    &:hover {
      border-bottom: 2px solid ${theme.colors.blueOnWhite};
      color: ${theme.colors.blueOnWhite};
    }
    ` : `
    &:hover {
      color: #336e9e;
    }
    `}
  }
`

const PublicNavbarRightButtons = styled.div`
  display: inline-block;
  text-align: right;
  margin: auto;
  margin-right: ${theme.padding.mainContentHorizontal};

  button {
    vertical-align: middle;
    margin-left: ${theme.padding.contentMargin};
  }

  @media (max-width: 1024px) {
    .btn {
      margin-left: ${theme.padding.contentMarginHalf};
    }
  }
`

type SsoButtonResponse =
| {
  isEnabled: true
  data: {
    fdaSsoUrl: string
  }
}
| {
  isEnabled: false
}

const useSiteSettingsSsoButtonQuery = () =>
  useQuery<SsoButtonResponse>(['site_settings', 'sso_button'], {
    queryFn: () => axios.get('/api/site_settings/sso_button').then((r: any) => r.data),
  })

type Props = {
  shouldShowLogo?: boolean,
}

const PublicNavbar = ({ shouldShowLogo = false }: Props) => {
  const [sticky, setSticky] = useState(false)
  const { data: ssoButtonResponse } = useSiteSettingsSsoButtonQuery()
  // Set up the sticky header
  useEffect(() => {
    const header = document.getElementById('pfda-navbar')
    const entireNavigationBar = document.getElementById('navigation-bar')
    if (!header || !entireNavigationBar) {
      return
    }

    const stickyPosition = entireNavigationBar.clientHeight
    const scrollCallBack = () => {
      if (window.pageYOffset > stickyPosition) {
        setSticky(true)
      } else {
        setSticky(false)
      }
    }
    window.addEventListener('scroll', scrollCallBack)
    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('scroll', scrollCallBack)
    }
  }, [])

  const onRequestAccess = () => {
    window.location.assign('/request_access')
  }

  const onLogIn = () => {
    window.location.assign('/login')
  }
  const onLogInWithSSO = () => {
    if (ssoButtonResponse?.isEnabled) {
      window.location.assign(ssoButtonResponse.data.fdaSsoUrl)
    }
  }
  const { pathname } = useLocation()
  const getLinkClassName = (linkPath: string) => {
    if (linkPath === '/') { // Special case
      return classNames({
        'current': pathname === linkPath,
      })
    }
    return classNames({
      'current': pathname.startsWith(linkPath),
    })
  }

  return (
    <StyledPublicNavbar id="pfda-navbar" isSticky={sticky}>
      {sticky ? (
        <StyledPFDALogoDark className="pfda-navbar-logo" />
      ) : (
        <StyledPFDALogoLight className="pfda-navbar-logo" hidden={!shouldShowLogo} />
      )}
      <PublicNavbarCenterButtons isSticky={sticky}>
        <Link to='/' className={getLinkClassName('/')}>Overview</Link>
        <Link to='/challenges' className={getLinkClassName('/challenges')}>Challenges</Link>
        <Link to='/news' className={getLinkClassName('/news')}>News</Link>
        <Link to='/experts' className={getLinkClassName('/experts')}>Experts</Link>
        <Link to='/about' className={getLinkClassName('/about')}>About</Link>
        <a href="/uniisearch" target="_blank">UNII Search</a>
      </PublicNavbarCenterButtons>
      <PublicNavbarRightButtons>
        <Button onClick={onRequestAccess}>Request Access</Button>
        <Button type="primary" onClick={onLogIn}>Log In</Button>
        {ssoButtonResponse?.isEnabled && (
          <Button type="primary" onClick={onLogInWithSSO}>Log In With SSO</Button>
        )}
      </PublicNavbarRightButtons>
    </StyledPublicNavbar>
  )
}


export {
  PublicNavbar,
}

export default PublicNavbar
