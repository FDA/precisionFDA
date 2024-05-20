import styled from 'styled-components'
import { colors } from '../../styles/theme'

export const ItemDate = styled.div`
  color: ${colors.textMediumGrey};
  font-size: 14px;
  font-weight: bold;
  border-top: 1.5px solid #667070;
  line-height: 36px;
  padding-right: 16px;
  min-width: 128px;
  max-width: 128px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
`

export const NewsListItem = styled.div`
  display: flex;
  gap: 32px;
`

export const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
`
export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;

  a {
    cursor: pointer;
  }

  iframe {
    width: 100%;
    max-width: 600px;
    min-height: 300px;
  }
`
