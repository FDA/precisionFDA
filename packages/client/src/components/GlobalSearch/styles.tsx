import styled from 'styled-components'
import { Pill } from '../../features/home/show.styles'
import { Button } from '../Button'

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  max-height: 90vh;

  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 8px;
  }

  @media (max-height: 700px) {
    max-height: 98vh;
  }
`
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px 16px;
  border-bottom: 1px solid var(--tertiary-100);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--tertiary-800);
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`

export const HeaderContent = styled.div`
  flex: 1;
`

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: var(--tertiary-900);
  color: var(--tertiary-50);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.1s ease;
  margin-left: 16px;
  flex-shrink: 0;

  &:hover {
    background: var(--tertiary-800);
    color: #374151;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    gap: 10px;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`

export const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 600px;
  background: var(--background);
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    max-height: calc(95vh - 200px);
  }

  @media (max-height: 700px) {
    height: auto;
    max-height: calc(98vh - 180px);
  }

  @media (max-height: 600px) {
    max-height: calc(98vh - 150px);
  }
`

export const SearchBar = styled.div`
  position: relative;
  padding: 20px 24px;
  border-bottom: 1px solid var(--tertiary-100);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 16px;
  }

  .iconwrap {
    border: none;
    z-index: 1;
    position: absolute;
    display: flex;
    align-items: center;
    padding-left: 16px;
    padding-top: 16px;
    background: transparent;
    color: var(--tertiary-300);
    transition: color 0.1s ease;

    @media (max-width: 768px) {
      padding-top: 12px;
      padding-left: 12px;
    }

    &.iconwrap-right {
      right: 28px;
      top: 0;
      bottom: 0;
      margin: auto 0;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      justify-content: center;
      transition: all 0.1s ease;

      @media (max-width: 768px) {
        right: 20px;
        width: 28px;
        height: 28px;
      }

      &:hover {
        background: var(--tertiary-100);
        color: var(--warning-500);
        transform: scale(1.05);
      }
    }
  }

  input {
    padding: 12px 48px;
    font-size: 15px;
    border-radius: 12px;
    border: 2px solid var(--tertiary-200);
    background: var(--background);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 768px) {
      padding: 10px 40px;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      padding: 10px 36px;
      font-size: 13px;
    }

    &:focus {
      outline: none;
      border-color: var(--primary-400);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }

    &::placeholder {
      color: var(--c-text-400);
      font-size: 14px;

      @media (max-width: 768px) {
        font-size: 13px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
      }
    }
  }
`

export const FilterSidebar = styled.div`
  width: 220px;
  background: var(--tertiary-50);
  padding: 24px;
  border-right: 1px solid var(--tertiary-100);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.02);
  border-right-color: rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    width: 100%;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid var(--tertiary-100);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
`

export const FilterTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--c-text-500);

  @media (max-width: 768px) {
    margin: 0 12px 0 0;
    flex-shrink: 0;
  }
`

export const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 0 -16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.1s ease;
  position: relative;
  font-size: 14px;
  color: var(--c-text-600);
  background: transparent;
  font-weight: 500;
  border: 1px solid transparent;

  &[data-selected='true'] {
    color: var(--primary-100);
    background: var(--primary-100);
    border-color: var(--primary-200);
    color: var(--primary-900);
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    margin: 0;
    padding: 8px 12px;
    font-size: 13px;
    gap: 8px;
    flex-shrink: 0;
  }

  &:hover {
    background: var(--tertiary-100);
    border-color: var(--tertiary-200);
  }

  &[data-selected='true']:hover {
    background: var(--primary-100);
    border-color: var(--primary-300);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: var(--primary-500);
    border-radius: 0 3px 3px 0;
    transition: height 0.1s ease;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &[data-selected='true']::before {
    height: 24px;
  }

  input[type='radio'] {
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--primary-500);
    cursor: pointer;

    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
    }
  }
`

export const SearchResults = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }

  @media (max-height: 600px) {
    padding: 16px;
  }
`

export const SearchResultItem = styled.div`
  padding: 12px 16px;
  background: var(--background);
  border: 1px solid var(--tertiary-300);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.09s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 12px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(135deg, var(--primary-400) 0%, var(--purple-400) 100%);
    opacity: 0;
    transition: opacity 0.05s ease;
  }

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    @media (max-width: 768px) {
      transform: translateX(2px);
    }

    &::before {
      opacity: 1;
    }

    span {
      color: var(--primary-600);
    }
  }

  a {
    color: inherit;
    text-decoration: none;
    display: block;
    height: 100%;
  }
`

export const ResultTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text-700);
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`

export const ResultDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--c-text-500);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 12px;
    margin: 0 0 8px 0;
    -webkit-line-clamp: 2;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`

export const ResultLink = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--primary-500);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.1s ease;

  @media (max-width: 768px) {
    font-size: 11px;
  }

  &::after {
    content: ' →';
    transition: transform 0.1s ease;
  }

  &:hover::after {
    transform: translateX(3px);
  }
`

export const SectionHeader = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--c-text-500);
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 13px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }

  &:first-child {
    margin-top: 0;
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--tertiary-200) 0%, transparent 100%);
  }
`

export const ViewMoreButton = styled(Button)`
  border: none;
  color: var(--tertiary-50);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 20px;
  margin: 16px auto;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 8px 16px;
    margin: 12px auto;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    &::after {
      transform: translateX(3px);
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  gap: 24px;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;

  > * {
    position: relative;
    z-index: 1;
  }

  svg {
    width: 64px;
    height: 64px;
    color: var(--tertiary-300);
    opacity: 0.6;
  }

  p {
    font-size: 18px;
    font-weight: 700;
    max-width: 400px;
    line-height: 1.6;
    margin: 0;
    color: var(--c-text-300);
  }

  @media (max-width: 768px) {
    height: 250px;
    gap: 20px;
    padding: 30px 16px;

    svg {
      width: 48px;
      height: 48px;
    }

    p {
      font-size: 15px;
      max-width: 280px;
    }
  }
`

export const CountPill = styled(Pill)`
  margin-left: auto;
  min-width: 2.5ch;
  text-align: center;
  background-color: var(--tertiary-100);
  color: var(--c-text-600);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;

  label[data-selected='true'] & {
    background-color: var(--primary-200);
    color: var(--primary-700);
    
    background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.3);
    color: var(--primary-600);
  }
`
