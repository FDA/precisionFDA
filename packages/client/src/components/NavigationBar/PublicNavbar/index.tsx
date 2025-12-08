import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { onLogInWithSSO, useSiteSettingsQuery } from '../../../features/auth/useSiteSettingsQuery'
import { Button } from '../../Button'
import { PFDALogoDark, PFDALogoLight } from '../PFDALogo'
import { MobileMenuOverlay, PageContainer, StyledPublicNavbar } from './styles'

type PublicNavbarProps = {
  shouldShowLogo?: boolean
}

const PublicNavbar = ({ shouldShowLogo = false }: PublicNavbarProps) => {
  const { data } = useSiteSettingsQuery()
  const { pathname } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const onRequestAccess = () => {
    window.location.assign('/request_access')
  }

  const onLogIn = () => {
    window.location.assign('/login')
  }

  const getNavLinkClassName = (linkPath: string) => {
    if (linkPath === '/') {
      return classNames('nav-link', {
        'active': pathname === linkPath,
      })
    }
    return classNames('nav-link', {
      'active': pathname.startsWith(linkPath),
    })
  }

  const getMobileNavLinkClassName = (linkPath: string) => {
    if (linkPath === '/') {
      return classNames('menu-nav-item', {
        'menu-nav-active': pathname === linkPath,
      })
    }
    return classNames('menu-nav-item', {
      'menu-nav-active': pathname.startsWith(linkPath),
    })
  }

  const toggleMobileMenu = () => {
    const newMenuState = !isMobileMenuOpen
    setIsMobileMenuOpen(newMenuState)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobileMenuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <StyledPublicNavbar>
        <PageContainer>
          <div className="navbar-content">
            <div className="brand-section">
              <PFDALogoLight
                className={classNames('brand-logo', 'brand-logo-light', {
                  hidden: !shouldShowLogo,
                })}
              />
            <PFDALogoDark 
              className="brand-logo brand-logo-dark" 
            />
            </div>

            <nav className="desktop-nav" role="navigation" aria-label="Primary navigation">
            <Link 
              to="/" 
              className={getNavLinkClassName('/')}
            >
                Home
              </Link>
            <Link 
              to="/challenges" 
              className={getNavLinkClassName('/challenges')}
            >
                Challenges
              </Link>
            <Link 
              to="/news" 
              className={getNavLinkClassName('/news')}
            >
                News
              </Link>
            <Link 
              to="/experts" 
              className={getNavLinkClassName('/experts')}
            >
                Experts
              </Link>
            <a 
              href="/uniisearch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-link"
            >
                UNII Search
              </a>
            <a 
              href="/ginas/app/ui" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-link"
            >
                GSRS
              </a>
            </nav>

            <div className="desktop-actions">
            <Button 
              className="action-btn action-btn-secondary" 
              onClick={onRequestAccess}
            >
                Request Access
              </Button>
            <Button 
              className="action-btn"
              data-variant="primary" 
              onClick={onLogIn}
            >
                Log In
              </Button>
              {data?.ssoButton.isEnabled && data.ssoButton.data && (
                <Button
                  className="action-btn"
                  data-variant="primary"
                  onClick={() => onLogInWithSSO(data.ssoButton.data?.ssoUrl || '')}
                >
                  Log In with SSO
                </Button>
              )}
            </div>

            <button
              className="mobile-menu-trigger"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              type="button"
            >
              <div className="hamburger-icon">
                <div className={classNames('hamburger-line', 'line-1', { 'menu-open': isMobileMenuOpen })}></div>
                <div className={classNames('hamburger-line', 'line-2', { 'menu-open': isMobileMenuOpen })}></div>
                <div className={classNames('hamburger-line', 'line-3', { 'menu-open': isMobileMenuOpen })}></div>
              </div>
            </button>
          </div>
        </PageContainer>
      </StyledPublicNavbar>

      <MobileMenuOverlay
        className={classNames({ 'menu-visible': isMobileMenuOpen })}
        onClick={closeMobileMenu}
      >
        <section
          className={classNames('menu-container', { 'menu-visible': isMobileMenuOpen })}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div className="menu-header">
            <PFDALogoDark className="menu-brand" id="mobile-menu-title" />
            <button 
              className="menu-close-btn"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              type="button"
            >
              ×
            </button>
          </div>

          <nav className="menu-nav" role="navigation" aria-label="Mobile navigation">
            <Link 
              to="/" 
              className={getMobileNavLinkClassName('/')}
              data-turbolinks="false"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/challenges" 
              className={getMobileNavLinkClassName('/challenges')}
              onClick={closeMobileMenu}
            >
              Challenges
            </Link>
            <Link 
              to="/news" 
              className={getMobileNavLinkClassName('/news')}
              onClick={closeMobileMenu}
            >
              News
            </Link>
            <Link 
              to="/experts" 
              className={getMobileNavLinkClassName('/experts')}
              onClick={closeMobileMenu}
            >
              Experts
            </Link>
            <a 
              href="/uniisearch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-nav-item"
              onClick={closeMobileMenu}
            >
              UNII Search
            </a>
            <a 
              href="/ginas/app/ui" 
              target="_blank" 
              rel="noopener noreferrer"
              className="menu-nav-item"
              onClick={closeMobileMenu}
            >
              GSRS
            </a>
          </nav>

          <div className="menu-actions">
            <Button
              className="menu-action-btn"
              onClick={() => {
                onRequestAccess()
                closeMobileMenu()
              }}
            >
              Request Access
            </Button>
            <Button
              className="menu-action-btn"
              data-variant="primary"
              onClick={() => {
                onLogIn()
                closeMobileMenu()
              }}
            >
              Log In
            </Button>
            {data?.ssoButton.isEnabled && data.ssoButton.data && (
              <Button
                className="menu-action-btn"
                data-variant="primary"
                onClick={() => {
                  onLogInWithSSO(data.ssoButton.data?.ssoUrl || '')
                  closeMobileMenu()
                }}
              >
                Log In with SSO
              </Button>
            )}
          </div>
        </section>
      </MobileMenuOverlay>
    </>
  )
}

export { PublicNavbar }
