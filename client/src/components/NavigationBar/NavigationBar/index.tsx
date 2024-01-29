import React, { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { SocialMediaButtons } from '../SocialMediaButtons'
import { theme } from '../../../styles/theme'
import { PublicNavbar } from '../PublicNavbar'
import { commonStyles } from '../../../styles/commonStyles'
import { MainBanner } from '../../Banner'
import { PageContainerMargin } from '../../Page/styles'


const NavigationBarBanner = styled.div`
  padding: 20px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

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
    font-size: 28px;
    font-weight: 400;
    margin: 0;
  }

  h2 {
    font-size: 18px;
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
  margin: 0;

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
  text-align: center;
  max-width: 640px;

  h2 {
    font-size: 20px;
    font-weight: 400;
    line-height: 133%;
    text-align: left;
    padding: 0;
    margin: 0;
  }

  @media (max-width: 640px) {
    margin: 0;
    align-self: flex-start;
  }
`

interface INavigationBarProps {
  title?: string,
  subtitle?: string,
  user?: any,
  children?: ReactNode
}

const NavigationBar = ({ children, title, subtitle, user }: INavigationBarProps) => {

  const isLoggedIn = user && Object.keys(user).length > 0
  const showSocialMediaButtons = !children  // Show social media buttons unless there's a custom header like in ChallengesDetailsPage
  // Displaying button text for social media button only happens in the landing page for a logged in user
  //   In this scenario we don't render the subtitle block in order to get the correct layout
  //   as the design does not include a title nor subtitle in this scenario
  const showSocialMediaButtonText = isLoggedIn && (useLocation().pathname === '/')

  const renderTitleIfDefined = () => {
    if (title || subtitle || showSocialMediaButtonText) {
      return (
        <PageContainerMargin>
          <NavigationBarBanner>
            <NavigationBarLogoAndTitle>
              <h1>{title}</h1>
            </NavigationBarLogoAndTitle>
            {!showSocialMediaButtonText &&
              <NavigationBarSubtitle>
                <h2>{subtitle}</h2>
              </NavigationBarSubtitle>
            }
            {showSocialMediaButtons &&
              <SocialMediaButtons />
            }
          </NavigationBarBanner>
        </PageContainerMargin>
      )
    }
    return ''
  }

  return (
    <MainBanner id="navigation-bar">
      {!isLoggedIn && (
        <PublicNavbar shouldShowLogo />
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
