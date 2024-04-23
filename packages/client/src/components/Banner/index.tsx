import styled, { css } from 'styled-components'
import navBackground from '../../assets/NavbarBackground.png'
import { commonStyles } from '../../styles/commonStyles'
import { Button } from '../Button'

export const MainBanner = styled.div`
  --c-banner-highlight: hsl(207, 70%, 51%);
  --c-banner-base: white;
  --c-banner-base-2: #ddd;

  width: 100%;
  background-color: rgb(22,19,14);
  background-image: url(${navBackground});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: var(--c-banner-base);
`

export const ResourceBanner = styled(MainBanner)`
  display: flex;
  flex-flow: row nowrap;
  gap: 64px;
  padding: 18px 32px;
  margin: 0 auto;
  box-sizing: border-box;
  border-bottom: 1px solid var(--c-layout-border);

  @media (max-width: 640px) {
    flex-flow: column wrap;
  }
`

export const BannerTitle = styled.h1`
  ${commonStyles.bannerTitle}
  color: var(--c-banner-base);
  margin: auto 0;
  margin-right: 16px;
`

export const BannerRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const BannerPicker = styled.div`
  display: flex;
  gap: 48px;
  margin: 0;
`

export const BannerPickerItem = styled(Button)<{ $isActive?: boolean }>`
  display: inline-block;
  font-weight: 500;
  font-size: 18px;
  line-height: 20px;
  color: var(--c-banner-base);
  background: transparent;
  letter-spacing: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  border-bottom: 4px solid transparent;
  cursor: pointer;

  &:hover {
    background: transparent;
    border-bottom: 4px solid var(--c-banner-highlight);
    color: var(--c-banner-base);
  }

  ${({ $isActive }) => (
    $isActive && css`
      color: var(--c-banner-highlight);
      border-bottom: 4px solid var(--c-banner-highlight);

      &:hover {
        color: var(--c-banner-highlight);
      }
    `
  )}
`

export const BannerDescription = styled.span`
  color: var(--c-banner-base);
  font-size: 16px;
  margin-bottom: 8px;
`

export const BannerPickedInfo = styled.span`
  margin-top: 4px;
  color: var(--c-banner-base-2);
  font-size: 12px;
`
