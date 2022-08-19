import styled, { css } from 'styled-components'
import navBackground from '../../assets/NavbarBackground.png'
import { commonStyles } from '../../styles/commonStyles'
import { colors, fontSize, fontWeight, padding, sizing } from '../../styles/theme'
import { Button } from '../Button'

export const MainBanner = styled.div`
  width: 100%;
  background-color: rgb(22,19,14);
  background-image: url(${navBackground});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: white;
`

export const ResourceBanner = styled(MainBanner)`
  display: flex;
  flex-flow: row nowrap;
  padding: 18px ${padding.mainContentHorizontal};
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    flex-flow: column wrap;
  }
`

export const BannerTitle = styled.h1`
  ${commonStyles.bannerTitle}
  color: ${colors.textWhite};
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

export const BannerPickerItem = styled(Button)<{ isActive?: boolean }>`
  display: inline-block;
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.h2};
  line-height: 20px;
  color: ${colors.textWhite};
  background: transparent;
  letter-spacing: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  border-bottom: ${sizing.highlightBarWidth} solid transparent;
  cursor: pointer;

  &:hover {
    background: transparent;
    border-bottom: ${sizing.highlightBarWidth} solid ${colors.primaryBlue};
    color: ${colors.textWhite};
  }

  ${({ isActive }) => (
    isActive && css`
      color: ${colors.primaryBlue};
      border-bottom: ${sizing.highlightBarWidth} solid ${colors.primaryBlue};

      &:hover {
        color: ${colors.primaryBlue};
      }
    `
  )}
`

export const BannerDescription = styled.span`
  color: ${colors.textWhite};
  font-size: 16px;
  margin-bottom: 8px;
`

export const BannerPickedInfo = styled.span`
  margin-top: 4px;
  color: ${colors.textLightGrey};
  font-size: 12px;
`

// TODO: Design other background images for different areas of the site
