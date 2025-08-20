import styled, { css } from 'styled-components'
import { PageContainerMargin } from '../../Page/styles'
import { fallback } from './fallback.styles'

export const PageContainer = styled(PageContainerMargin)`
  height: 100%;
`

export const StyledPublicNavbar = styled.div`
  --bg: var(--background-shaded);
  height: 64px;
  position: fixed;
  top: var(--rails-alert-height);
  left: 0;
  right: 0;
  z-index: 100;
  
  /* Scroll-triggered animations */
  animation: navbar-background linear both;
  animation-timeline: scroll(root);
  animation-range: 0px 100px;
  
  background-color: transparent;
  border-bottom: 1px solid transparent;

  @keyframes navbar-background {
    from {
      background-color: transparent;
      border-bottom-color: transparent;
      top: var(--rails-alert-height);
    }
    to {
      background-color: var(--bg);
      border-bottom-color: var(--c-layout-border-200);
      top: 0px;
    }
  }

  .navbar-content {
    display: flex;
    flex: 1;
    max-width: 1330px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .brand-section {
    position: relative;
    width: 180px;
    height: 40px;
    flex-shrink: 0;
  }

  .brand-logo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s ease-in-out;
  }

  .brand-logo-light {
    opacity: 1;
    animation: logo-fade-out linear both;
    animation-timeline: scroll(root);
    animation-range: 0px 100px;
    
    &.hidden {
      visibility: hidden;
    }
  }
  
  .brand-logo-dark {
    opacity: 0;
    animation: logo-fade-in linear both;
    animation-timeline: scroll(root);
    animation-range: 0px 100px;
  }
  
  @keyframes logo-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes logo-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .desktop-nav {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }

  .nav-link {
    --text-color: white;
    --border-color: white;
    
    position: relative;
    padding: 8px 0;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    color: var(--text-color);
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
    
    animation: nav-link-colors linear both;
    animation-timeline: scroll(root);
    animation-range: 0px 100px;
    
    &:hover {
      border-bottom-color: var(--border-color);
    }
    
    &.active {
      color: var(--primary-400);
      border-bottom-color: var(--primary-400);

      &:hover {
        color: var(--primary-400);
        border-bottom-color: var(--primary-400);
      }
    }
  }
  
  @keyframes nav-link-colors {
    from { 
      --text-color: white;
      --border-color: white;
    }
    to { 
      --text-color: var(--base);
      --border-color: hsl(240, 4%, 16%)
    }
  }

  .desktop-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .action-btn {
    font-weight: 600;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
  }

  .action-btn-secondary {
    background: transparent;
    border: 1px solid white;
    animation: secondary-btn-colors linear both;
    animation-timeline: scroll(root);
    animation-range: 0px 100px;
    color: white;
  }
  
  @keyframes secondary-btn-colors {
    from { 
      color: white;
      border-color: white;
    }
    to { 
      color: var(--base);
      border-color: var(--base);
    }
  }

  .mobile-menu-trigger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    &:focus {
      outline: 2px solid var(--primary-400);
      outline-offset: 2px;
    }
  }

  .hamburger-icon {
    width: 24px;
    height: 18px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger-line {
    width: 100%;
    height: 2px;
    border-radius: 1px;
    background-color: white;
    transition: all 0.3s ease-in-out;
    transform-origin: center;
    animation: hamburger-line-colors linear both;
    animation-timeline: scroll(root);
    animation-range: 0px 100px;
    
    &.line-1.menu-open {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    &.line-2.menu-open {
      opacity: 0;
      transform: scale(0);
    }
    
    &.line-3.menu-open {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }
  
  @keyframes hamburger-line-colors {
    from { background-color: white; }
    to { background-color: var(--tertiary-900); }
  }

  /* Responsive behavior */
  @media (max-width: 1256px) {
    .desktop-actions {
      display: none;
    }
    
    .mobile-menu-trigger {
      display: block;
    }
  }

  @media (max-width: 768px) {
    padding: 0 16px;

    .desktop-nav {
      display: none;
    }
  }

  ${({ theme }) => theme.colorMode === 'dark' ? css`
    --bg: var(--background-shaded);
    
    /* In dark mode, use light logo */
    .brand-logo-light {
      opacity: 1;
      animation: none;
    }
    
    .brand-logo-dark {
      opacity: 0;
      animation: none;
    }
  `: `
    --bg: var(--c-subtleblue);
  `}

  ${fallback}


`

/* Mobile menu overlay */
export const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  
  &.menu-visible {
    opacity: 1;
    visibility: visible;
  }

  .menu-container {
    position: fixed;
    top: 0;
    right: -100%;
    width: 320px;
    max-width: 90vw;
    height: 100vh;
    background-color: var(--background-shaded);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    transition: right 0.3s ease-in-out;
    z-index: 201;
    display: flex;
    flex-direction: column;
    
    &.menu-visible {
      right: 0;
    }
  }

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--c-layout-border-200);
  }

  .menu-brand {
    width: 140px;
    height: 32px;
  }

  ${({ theme }) => theme.colorMode === 'dark' && `
    .menu-brand {
      filter: invert(1);
    }
  `}

  .menu-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    color: var(--tertiary-900);
    font-size: 24px;
    line-height: 1;
    transition: all 0.2s ease-in-out;
    
    &:hover {
      background-color: var(--c-layout-border-200);
      color: var(--primary-600);
    }
    
    &:focus {
      outline: 2px solid var(--primary-600);
      outline-offset: 2px;
    }
  }

  .menu-nav {
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;
  }

  .menu-nav-item {
    display: block;
    padding: 16px 24px;
    text-decoration: none;
    color: var(--tertiary-900);
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid var(--c-layout-border-200);
    transition: background-color 0.2s ease-in-out;
    
    &:hover {
      background-color: var(--c-app-header-menu-hover);
    }
    
    &.menu-nav-active {
      color: var(--primary-600);
      background-color: var(--c-layout-border-200);
      font-weight: 600;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }

  .menu-actions {
    padding: 24px;
    border-top: 1px solid var(--c-layout-border-200);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .menu-action-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
  }

  @media (min-width: 1257px) {
    display: none !important;
  }

  @media (max-width: 480px) {
    .menu-container {
      width: 100vw;
      right: -100vw;
      
      &.menu-visible {
        right: 0;
      }
    }
  }
`
