import styled, { css } from 'styled-components'
import { theme } from './theme'

export const imageReset = css`
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  font-style: italic;
  background-repeat: no-repeat;
  background-size: cover;
  shape-margin: 0.75rem;
`

export const commonStyles = {
  pageTitle: css`
    font-size: ${theme.fontSize.pageTitle};
    font-weight: ${theme.fontWeight.regular};
  `,

  bannerTitle: css`
    font-size: ${theme.fontSize.bannerTitle};
    font-weight: ${theme.fontWeight.bold};
  `,

  titleStyle: css`
    font-size: ${theme.fontSize.h1};
    font-weight: ${theme.fontWeight.bold};
    color: ${theme.colors.textBlack};
  `,

  bodyTextStyle: css`
    font-size: ${theme.fontSize.body};
    font-weight: ${theme.fontWeight.regular};
    color: ${theme.colors.textMediumGrey};
  `,

  sectionHeading: css`
    color: ${theme.colors.textMediumGrey};
    font-weight: ${theme.fontWeight.black};
    font-size: ${theme.fontSize.subheading};
    letter-spacing: 0.05em;
    margin-top: ${theme.padding.contentMargin};
  `,

  viewAllButton: css`
    width: 192px;
    margin: auto 0;
    text-align: left;
    border-top: 1px solid ${theme.colors.highlightBlue};
  `,

  mainContainerTwoColumns: css`
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-items: stretch;
    max-width: ${theme.sizing.mainContainerMaxWidth};
    margin-left: auto;
    margin-right: auto;

    @media (min-width: 1024px) {
      flex-flow: row nowrap;
    }
  `,

  mainContainerTwoColumns_LeftColumn: css`
    flex-grow: 1;
    padding-left: ${theme.padding.mainContentHorizontal};
    padding-right: ${theme.padding.mainContentHorizontal};
    padding-top: ${theme.padding.contentMarginLarge};
    padding-bottom: ${theme.padding.contentMarginLarge};
  `,

  mainContainerTwoColumns_RightColumn: css`
    width: ${theme.sizing.largeColumnWidth};
    flex: 0 0 ${theme.sizing.largeColumnWidth};
    padding-left: 0;
    padding-right: ${theme.padding.mainContentHorizontal};
    padding-top: ${theme.padding.contentMarginLarge};
    padding-bottom: ${theme.padding.contentMarginLarge};
  `,

  listContainer: css`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: stretch;
    justify-content: center;
    list-style: none;
    padding-inline-start: 0px;
    margin-top: ${theme.padding.contentMargin};
  `,

  listPagination: css`
    display: flex;
    justify-content: center;
    margin: 0 auto;

    &__page {
      color: ${theme.colors.textBlack};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 6px;
      margin: 0 6px;
      width: auto;
      background: none;
      border: none;

      &--active {
        color: ${theme.colors.blueOnWhite};
      }

      &--prev, &--next {
        cursor: pointer;
        color: ${theme.colors.highlightBlue};
        background-image: none;
        background-color: #ffffff;
        border: 1px solid ${theme.colors.highlightBlue};
        border-radius: 3px;
        white-space: nowrap;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: bold;
        text-transform: capitalize;
        line-height: 1.428571429;

        &:not(.disabled) {
          &:hover, &:focus, &:active, &.active {
            color: ${theme.colors.highlightBlue};
            border-color: #63a5de;
            background-color: rgb(244, 248, 253);
          }
        }
      }

      &--prev::after {
        content: ' Prev';
      }

      &--next::before {
        content: 'Next ';
      }
    }
  `,
}


export const FlexRow = styled.div`
  display: flex;
`
export const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
`
