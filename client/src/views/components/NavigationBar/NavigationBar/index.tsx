import React from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { SocialMediaButtons } from '../SocialMediaButtons'
import { PFDALogoLight } from '../PFDALogo'
import { theme } from '../../../../styles/theme'
import { PublicNavbar } from '../PublicNavbar'
import { commonStyles } from '../../../../styles/commonStyles'
import { Header } from '../../../../components/Header'
import { MainBanner } from '../../../../components/Banner'


const NavigationBarBanner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0px ${theme.padding.mainContentHorizontal};
  max-width: ${theme.sizing.mainContainerMaxWidth};
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-flow: column wrap;
  }
`

export const NavigationBarPublicLandingTitle = styled.div`
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: ${theme.padding.mainContentVertical};

  h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 400;
    margin: 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 400;
    line-height: 133%;
    padding-bottom: 0px;
    margin-bottom: 0px;
  }

  .pfda-navbar-logo {
    width: 180px;
    height: 40px;
  }
`

const NavigationBarLogoAndTitle = styled.div`
  order: 1;
  text-align: left;
  width: ${theme.sizing.thumbnailWidth};
  margin: 0 ${theme.padding.mainContentHorizontal} ${theme.padding.mainContentVertical} 0;

  img {
    margin-left: 3px;
    margin-bottom: ${theme.padding.contentMargin};
  }

  h1 {
    ${commonStyles.bannerTitle}
    color: #fff;
    margin: 0;
  }

  .pfda-navbar-logo {
    width: 180px;
    height: 40px;
  }

  @media (min-width: 1024px) {
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    margin: 0;
  }
`

const NavigationBarSubtitle = styled.div`
  order: 2;
  flex-shrink: 1;
  flex-grow: 1;
  align-self: flex-end;
  text-align: center;
  max-width: 640px;
  margin-bottom: ${theme.padding.mainContentVertical};

  h2 {
    font-size: 20px;
    font-weight: 400;
    line-height: 133%;
    text-align: left;
    padding-bottom: 0px;
    margin-bottom: 0px;
  }

  @media (max-width: 640px) {
    margin: 0;
  }
`

const PublicNavbarWrapper = styled.div`
  height: ${theme.sizing.navigationBarHeight};
  max-width: ${theme.sizing.mainContainerMaxWidth};
  margin: 0 auto;
`


interface INavigationBarProps {
  title?: string,
  subtitle?: string,
  showLogoOnNavbar?: boolean,
  user?: any,
}

const NavigationBar : React.FunctionComponent<INavigationBarProps> = ({ children, title, subtitle, showLogoOnNavbar, user }) => {

  const isLoggedIn = user && Object.keys(user).length > 0

  const showLogoAboveTitle = !isLoggedIn  // When user is logged in, the title is embedded in the navbar instead of above the title
  const showSocialMediaButtons = !children  // Show social media buttons unless there's a custom header like in ChallengesDetailsPage
  // Displaying button text for social media button only happens in the landing page for a logged in user
  //   In this scenario we don't render the subtitle block in order to get the correct layout
  //   as the design does not include a title nor subtitle in this scenario
  const showSocialMediaButtonText = isLoggedIn && (useLocation().pathname == '/')

  const renderTitleIfDefined = () => {
    if (title || subtitle || showSocialMediaButtonText) {
      return (
        <NavigationBarBanner>
          <NavigationBarLogoAndTitle>
            {showLogoAboveTitle ? <PFDALogoLight /> : <div className="pfda-navbar-logo logo-img logo-img-none" />}
            <h1>{title}</h1>
          </NavigationBarLogoAndTitle>
          {!showSocialMediaButtonText &&
            <NavigationBarSubtitle>
              <h2>{subtitle}</h2>
            </NavigationBarSubtitle>
          }
          {showSocialMediaButtons &&
            <SocialMediaButtons showText={showSocialMediaButtonText} />
          }
        </NavigationBarBanner>
      )
    }
    return ''
  }

  // TODO: WIP and not ready but will replace _navbar.html.erb in Rails eventually
  const showLoggedInNavBar = isLoggedIn && false

  return (
    <MainBanner id="navigation-bar">
      {showLoggedInNavBar && (
        <Header />
      )}
      {!isLoggedIn && (
        <PublicNavbarWrapper>
          <PublicNavbar showLogo={showLogoOnNavbar} />
        </PublicNavbarWrapper>
      )}
      {renderTitleIfDefined()}
      {children}
    </MainBanner>
  )
}


export {
  NavigationBar,
  NavigationBarBanner,
}

export default NavigationBar
