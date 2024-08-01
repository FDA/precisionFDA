import styled, { css } from 'styled-components'
import { Button } from '../../components/Button'
import { colors, fontWeight } from '../../styles/theme'
import { TimeStatus } from './types'

export const DateArea = styled.div`
  display: flex;
  /* align-content: center; */
  align-items: center;
  font-size: 12px;
  vertical-align: center;
  gap: 6px;

  .challenge-date-label {
    font-size: 10px;
    color: #667070;
    text-transform: uppercase;
  }
  .challenge-date {
    font-weight: 500;
  }
  .challenge-date-remaining {
    font-weight: 600;
    padding-left: 8px;
  }
`

export const ViewDetailsButton = styled(Button)`
  font-weight: ${fontWeight.bold};
  width: fit-content;
`

const statusCss = css`
  display: block;
  position: absolute;
  padding: 2px 4px;
  color: white;
  font-weight: bold;
  font-size: 12px;
`
export const ItemImage = styled.div<{ $timeStatus: TimeStatus }>`
  position: relative;
  min-width: 200px;
  max-width: 200px;

  ${props => {
    if (props.$timeStatus === 'current')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.highlightGreen};
          content: 'OPEN';
        }
      `
    if (props.$timeStatus === 'upcoming')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.darkYellow};
          content: 'UPCOMING';
        }
      `
    if (props.$timeStatus === 'ended')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.darkGreyOnGrey};
          content: 'ENDED';
        }
      `
    return null
  }}
`
