import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Svg } from '../../../components/icons/Svg'

export const SpaceMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const SpaceHeaderDescrip = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 650px;
`

export const IconBadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`

export const IconBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 5px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  border: 1px solid transparent;

  &[data-variant='protected'] {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);

    ${Svg} {
      color: #3b82f6;
      filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.3));
    }

    &:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
      border-color: rgba(59, 130, 246, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
  }

  &[data-variant='restricted'] {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);

    ${Svg} {
      color: #ef4444;
      filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.3));
    }

    &:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 101, 101, 0.15) 100%);
      border-color: rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }
  }

  ${Svg} {
    width: 14px;
    height: 14px;
    transition: all 0.2s ease;
  }

  span {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.9;
  }
`

export const DescriptionText = styled.div`
  font-size: 14px;
  color: var(--c-text-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`

export const SpaceHeaderTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text-700);
  margin: auto 0;
  display: inline-block;
  line-height: 1.2;

  ${Svg} {
    margin-left: 8px;
  }
`

export const ActionButton = styled(Button)`
  color: var(--c-text-700);
  background: var(--tertiary-70);
  border: 1px solid var(--c-layout-border);
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tertiary-50);
    color: var(--c-text-800);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

export const Tab = styled.div`
  font-size: 14px;
  font-weight: 900;
  box-sizing: border-box;
  background-color: var(--success-600);
  border: 2px solid white;
  border-radius: 8px;
  padding: 8px 20px;
  flex: 1 0 50%;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: 300px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &[data-variant='shared'] {
    background: linear-gradient(135deg, oklch(56% 0.15 155.65) 0%, oklch(60% 0.18 155.65) 100%);
    border-color: oklch(76% 0.15 155.65);
    color: oklch(90% 0.08 155.65);
    margin-left: -5px;
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &[data-isactive='false'] {
      opacity: 0.6;
      background: linear-gradient(135deg, oklch(43% 0.05 155.65) 0%, oklch(46% 0.08 155.65) 100%);
      border-color: oklch(76% 0.05 155.65);
      box-shadow: 28px 0 10px -20px rgba(0, 0, 0, 0.8) inset;
      transform: scale(0.985);
      z-index: 1;

      &:hover {
        opacity: 0.75;
        transform: scale(0.99);
      }
    }
  }

  &[data-variant='private'] {
    background: linear-gradient(135deg, oklch(56% 0.15 308.12) 0%, oklch(60% 0.18 308.12) 100%);
    border-color: oklch(76% 0.15 308.12);
    color: oklch(96% 0.08 308.12);
    margin-right: -5px;
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &[data-isactive='false'] {
      opacity: 0.6;
      background: linear-gradient(135deg, oklch(50% 0.05 300.12) 0%, oklch(53% 0.08 300.12) 100%);
      border-color: oklch(76% 0.05 308.12);
      box-shadow: -28px 0 10px -20px rgba(0, 0, 0, 0.8) inset;
      transform: scale(0.985);
      z-index: 1;

      &:hover {
        opacity: 0.75;
        transform: scale(0.99);
      }
    }
  }

  p {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 400;
    text-wrap: pretty;
    opacity: 0.9;
  }
`

export const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex: 1 0 50%;
  max-width: 500px;
  gap: 4px;

  ${Tab} {
    min-height: 40px;
    justify-content: center;
    text-align: center;

    p {
      display: none;
    }
  }

  @media (min-width: 950px) {
    max-width: 550px;
    min-height: auto;

    ${Tab} {
      justify-content: flex-start;
      align-items: flex-start;
      text-align: left;
      min-height: 48px;

      p {
        display: initial;
      }
    }
  }
`

export const TopSpaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  align-items: flex-start;

  @media (min-width: 950px) {
    flex-wrap: nowrap;
  }
`

export const SpaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--background-shaded);
  padding: 16px 32px;
  border-bottom: 1px solid var(--c-layout-border);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: transparent;
    transition: all 0.5s ease;
  }

  &[data-isshared='true'] {
    &::before {
      background: linear-gradient(90deg, oklch(56% 0.15 155.65) 0%, oklch(60% 0.18 155.65) 50%, oklch(56% 0.15 155.65) 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    box-shadow: 0 -20px 15px -20px oklch(56% 0.15 155.65) inset;
  }

  &[data-isprivate='true'] {
    &::before {
      background: linear-gradient(90deg, oklch(56% 0.15 308.12) 0%, oklch(60% 0.18 308.12) 50%, oklch(56% 0.15 308.12) 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    box-shadow: 0 -20px 15px -20px oklch(56% 0.15 308.12) inset;
  }
`

export const SpaceTopRight = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1 1 auto;
  justify-content: flex-end;
  align-self: flex-start;
  align-items: flex-start;
`
