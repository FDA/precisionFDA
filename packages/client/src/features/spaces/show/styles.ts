import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Svg } from '../../../components/icons/Svg'

export const SpaceMainInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const SpaceHeaderDescrip = styled.div`
  font-size: 14px;
  color: var(--c-text-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  max-width: 650px;

  ${Svg} {
    margin-right: 8px;
  }
`

export const SpaceHeaderTitle = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text-700);
  margin: auto 0;
  margin-bottom: 8px;
  display: inline-block;

  svg {
    margin-left: 8px;
  }
`

export const ActionButton = styled(Button)`
  color: var(--c-text-700);
  background: var(--tertiary-70);
  border: 1px solid var(--c-layout-border);

  &:hover {
    background: var(--tertiary-50);
    color: var(--c-text-800);
  }
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  height: 32px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

export const Tab = styled.div`
  font-size: 14px;
  font-weight: 900;
  box-sizing: border-box;
  background-color: var(--success-600);
  border: 2px solid white;
  border-radius: 5px 5px 5px 5px;
  padding: 6px 20px;
  flex: 1 0 50%;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-width: 300px;
  overflow: hidden;
  
  &[data-variant="shared"] {
    background-color: oklch(56% 0.15 155.65);
    border-color: oklch(76% 0.15 155.65);
    color: oklch(90% 0.08 155.65);
    margin-left: -5px;
    z-index: 2;
    transition: box-shadow, transform 0.1s;
    
    &[data-isactive="false"] {
      opacity: 0.5;
      background-color: oklch(43% 0.05 155.65);
      border-color: oklch(76% 0.05 155.65);
      box-shadow: 28px 0 10px -20px rgba(0,0,0,1) inset;
      transform: scale(0.985);
      z-index: 1;
      &:hover {
        opacity: 0.55;
        transition: opacity 0.3s;
      }
    }
  }

  &[data-variant="private"] {
    background-color: oklch(56% 0.15 308.12);
    border-color: oklch(76% 0.15 308.12);
    color: oklch(96% 0.08 308.12);
    margin-right: -5px;
    z-index: 2;
    transition: box-shadow, transform 0.1s;
    
    &[data-isactive="false"] {
      opacity: 0.5;
      background-color: oklch(50% 0.05 300.12);
      border-color: oklch(76% 0.05 308.12);
      box-shadow: -28px 0 10px -20px rgba(0,0,0,1) inset;
      transform: scale(0.985);
      z-index: 1;
      &:hover {
        transition: opacity 0.3s;
        opacity: 0.55;
      }
    }
  }
  
  p {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 400;
    text-wrap: pretty;
  }
`

export const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex: 1 0 50%;
  max-width: 500px;
  
  ${Tab} {
    min-height: 38px;
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
      p {
        display: initial;
      }
    }
  }
`

export const TransparentTab = styled(Tab)`
  border: none;
  background: transparent;
  cursor: initial;
  color: var(--c-text-700);
`
export const KeyValRow = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
`

export const TopSpaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  @media (min-width: 950px) {
    flex-wrap: nowrap;
  }
`

export const SpaceHeader = styled.div`
  --background-color: var(--background-shaded);
  --border-color: var(--c-layout-border);

  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  padding: 18px 32px;
  border-bottom: 1px solid var(--border-color);
`

export const SpaceTopRight = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1 0 auto;
  gap: 16px;
  flex: 1 1 auto;
  justify-content: flex-end;
  align-self: flex-start;
`
