import type { ReactNode } from 'react'
import styled from 'styled-components'
import type { IUser } from '@/types/user'
import { MainBanner } from '../../Banner'
import { PageContainerMargin } from '../../Page/page.styles'
import { PublicNavbar } from '../PublicNavbar'

const NavigationBarBanner = styled(PageContainerMargin)`
  max-width: 1330px;
  display: flex;
  align-items: center;
  padding: 32px 0;
  flex-flow: row nowrap;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`

export const NavigationBarPublicLandingTitle = styled.div`
  flex-shrink: 1;
  flex-grow: 1;
  margin-bottom: 32px;

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
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .pfda-navbar-logo {
    width: 180px;
    height: 40px;
  }
`

const NavigationBarLogoAndTitle = styled.div`
  order: 1;
  text-align: left;
  width: 288px;
  margin: 0;

  img {
    margin-left: 3px;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
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
  font-size: 20px;
  font-weight: 300;
  line-height: 133%;
  text-align: left;
  padding: 0;
  margin: 0;
  padding-top: 1rem;

  @media (max-width: 640px) {
    margin: 0;
    align-self: flex-start;
  }
`

interface INavigationBarProps {
  title?: string
  subtitle?: string
  user?: IUser | null
  children?: ReactNode
}

const NavigationBar = ({ children, title, subtitle, user }: INavigationBarProps) => {
  const isLoggedIn = user && Object.keys(user).length > 0

  const renderTitleIfDefined = () => {
    if (title || subtitle) {
      return (
        <NavigationBarBanner>
          <NavigationBarLogoAndTitle>
            <h1>{title}</h1>
          </NavigationBarLogoAndTitle>
          <NavigationBarSubtitle>{subtitle}</NavigationBarSubtitle>
        </NavigationBarBanner>
      )
    }
    return ''
  }

  return (
    <>
      {!isLoggedIn && <PublicNavbar shouldShowLogo />}
      <MainBanner id="navigation-bar" style={{ paddingTop: !isLoggedIn ? '64px' : '0' }}>
        {renderTitleIfDefined()}
        {children}
      </MainBanner>
    </>
  )
}

export { NavigationBar, NavigationBarBanner }

export default NavigationBar
