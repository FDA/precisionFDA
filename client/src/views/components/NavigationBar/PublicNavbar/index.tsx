import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import classNames from 'classnames/bind'
import { PFDALogoLight, PFDALogoDark } from '../PFDALogo'
import { theme } from '../../../../styles/theme'
import { PageContainerMargin } from '../../../../components/Page/styles'
import { Button, ButtonSolidBlue } from '../../../../components/Button/index'
import { onLogInWithSSO, useSiteSettingsSsoButtonQuery } from '../../../../features/auth/useSiteSettingsSsoButtonQuery'

type StyledPublicNavbarProps = {
  isSticky?: boolean
}

const StyledPublicNavbar = styled(PageContainerMargin)<StyledPublicNavbarProps>`
  display: flex;
  height: ${theme.sizing.navigationBarHeight};
  text-align: center;
  vertical-align: middle;
  transition: all 0.18s ease-in-out;
  flex-direction: row;
  gap: 32px;

  nav > * {
    vertical-align: middle;
  }

  .logo-img-dark {
    display: none;
  }

  .pfda-navbar-logo {
    width: 180px;
    height: 40px;
  }

  @media (max-width: 930px) {
    overflow-x: auto;
  }

  ${props =>
    props.isSticky
      ? css`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: ${theme.colors.subtleBlue};
          border-bottom: 1px solid ${theme.colors.borderDefault};
          z-index: 20;
        `
      : ''}
`

type StyledPFDALogoProps = {
  hidden?: boolean
}

const pfdaLogoStyle = css`
  text-align: left;
  margin: auto;
  margin-left: ${theme.padding.mainContentHorizontal};
  width: 180px;
  height: 40px;
`

const StyledPFDALogoLight = styled(PFDALogoLight)<StyledPFDALogoProps>`
  margin-top: 8px;
  ${props =>
    props.hidden
      ? css`
          visibility: hidden;
        `
      : ''}
`

const StyledPFDALogoDark = styled(PFDALogoDark)`
  ${pfdaLogoStyle};
`
const PublicNavbarCenterButtons = styled.div<StyledPublicNavbarProps>`
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding-top: 8px;

  a {
    padding: 0;
    height: 20px;
    text-align: center;
    font-size: 13px;
    font-weight: 400;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    text-decoration: none;
    ${props =>
      props.isSticky
        ? css`
            color: ${theme.colors.textBlack};
          `
        : css`
            color: white;
          `}

    &:hover {
      ${props =>
        props.isSticky
          ? css`
              border-bottom: 2px solid black;
            `
          : css`
              border-bottom: 2px solid white;
            `}
    }
  }

  a.current {
    color: ${theme.colors.blueOnBlack};
    border-bottom: 2px solid ${theme.colors.blueOnBlack};

    ${props =>
      props.isSticky
        ? css`
            &:hover {
              border-bottom: 2px solid ${theme.colors.blueOnBlack};
              color: ${theme.colors.blueOnBlack};
            }
          `
        : css`
            &:hover {
              color: ${theme.colors.blueOnBlack};
            }
          `}
  }
`

const PublicNavbarRightButtons = styled.div<StyledPublicNavbarProps>`
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 8px;
  justify-self: flex-end;

  button {
    font-weight: 700;
    letter-spacing: normal;
  }

  ${({ isSticky }) =>
    isSticky &&
    css`
      margin-right: 32px;
    `}
`

type Props = {
  shouldShowLogo?: boolean
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

  const { pathname } = useLocation()
  const getLinkClassName = (linkPath: string) => {
    if (linkPath === '/') {
      // Special case
      return classNames({
        current: pathname === linkPath,
      })
    }
    return classNames({
      current: pathname.startsWith(linkPath),
    })
  }

  return (
    <StyledPublicNavbar as="nav" id="pfda-navbar" isSticky={sticky}>
      {sticky ? (
        <StyledPFDALogoDark className="pfda-navbar-logo" />
      ) : (
        <StyledPFDALogoLight
          className="pfda-navbar-logo"
          hidden={!shouldShowLogo}
        />
      )}
      <PublicNavbarCenterButtons isSticky={sticky}>
        <Link data-turbolinks="false" to="/" className={getLinkClassName('/')}>
          Overview
        </Link>
        <Link
          data-turbolinks="false"
          to="/challenges"
          className={getLinkClassName('/challenges')}
        >
          Challenges
        </Link>
        <Link
          data-turbolinks="false"
          to="/news"
          className={getLinkClassName('/news')}
        >
          News
        </Link>
        <Link
          data-turbolinks="false"
          to="/experts"
          className={getLinkClassName('/experts')}
        >
          Experts
        </Link>
        <Link
          data-turbolinks="false"
          to="/about"
          className={getLinkClassName('/about')}
        >
          About
        </Link>
        <a href="/uniisearch" target="_blank">
          UNII Search
        </a>
      </PublicNavbarCenterButtons>
      <PublicNavbarRightButtons isSticky={sticky}>
        <Button onClick={onRequestAccess}>Request Access</Button>
        <ButtonSolidBlue onClick={onLogIn}>Log In</ButtonSolidBlue>
        {ssoButtonResponse?.isEnabled && (
          <ButtonSolidBlue onClick={() => onLogInWithSSO(ssoButtonResponse)}>
            Log In With SSO
          </ButtonSolidBlue>
        )}
      </PublicNavbarRightButtons>
    </StyledPublicNavbar>
  )
}

export { PublicNavbar }

export default PublicNavbar
