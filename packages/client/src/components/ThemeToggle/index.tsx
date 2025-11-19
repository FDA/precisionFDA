import React from 'react'
import styled from 'styled-components'
import { LightModeIcon, DarkModeIcon } from '../icons/ColorModes'
import { useTheme } from '../../utils/ThemeContext'

interface ThemeToggleProps {
  className?: string
}

const StyledThemeToggle = styled.div`
  padding: 3px;
  width: fit-content;
  display: flex;
  border-radius: 9999px;
  border: 1px solid var(--c-layout-border);

  button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: inherit;
    color: var(--c-text-700);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: auto;

    &[data-active='true'] {
      background: var(--tertiary-100);
    }

    &:hover {
      opacity: 0.8;
    }
  }
`

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
}) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <StyledThemeToggle className={className}>
      <button 
        data-active={theme === 'light'} 
        onClick={() => toggleTheme()}
      >
        <LightModeIcon height={16} />
      </button>
      <button 
        data-active={theme === 'dark'} 
        onClick={() => toggleTheme()}
      >
        <DarkModeIcon height={16} />
      </button>
    </StyledThemeToggle>
  )
}

export default ThemeToggle
