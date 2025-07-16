import { css } from 'styled-components'

export const fallback = css`
 /* Fallback for browsers without scroll-timeline support */
  @supports not (animation-timeline: scroll()) {
    background-color: var(--c-subtleblue);
    border-bottom: 1px solid var(--c-layout-border-200);
    margin-bottom:120px;
    
    .brand-logo-light { 
      opacity: 0; 
    }
    
    .brand-logo-dark { 
      opacity: 1; 
    }
    
    .nav-link {
      --text-color: var(--tertiary-900);
      --border-color: var(--tertiary-900);
    }
    
    .action-btn-secondary {
      color: var(--tertiary-900);
      border-color: var(--tertiary-900);
    }
    
    .hamburger-line {
      background-color: var(--tertiary-900);
    }
    
    .mobile-menu-trigger:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  /* Dark mode fallback for browsers without scroll-timeline support */
  ${({ theme }) => theme.colorMode === 'dark' && css`
    @supports not (animation-timeline: scroll()) {
      .brand-logo-light { 
        opacity: 1; 
      }
      
      .brand-logo-dark { 
        opacity: 0; 
      }
      
      .nav-link {
        color: var(--base);
      }
      
      .action-btn-secondary {
        color: white;
        border-color: white;
      }
      
      .hamburger-line {
        background-color: white;
      }
      
      .mobile-menu-trigger:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  `}
`