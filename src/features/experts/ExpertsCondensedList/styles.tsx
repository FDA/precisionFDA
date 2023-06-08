import styled from 'styled-components'
import { colors } from '../../../styles/theme'

export const StyledCondensedList = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  margin-bottom: 16px;
`

export const ExpertImageCircleSmall = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
`

export const ExpertRow = styled.div`
  display: flex;
  flex: 1 0 auto;
  gap: 10px;
  align-items: center;
  font-size: 12px;
`

export const Name = styled.div`
  a {
    font-size: 13px;
    color: #333333;
    font-weight: bold;
  }
`

export const Info = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #646464;
`

export const StyledPreview = styled.div`
  font-weight: normal;
  font-size: 12px;
  color: ${colors.textDarkGrey};
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`
export const CeatedAtDate = styled.div`
  font-weight: normal;
  font-size: 12px;
  color: ${colors.colorDateGrey};
`

export const ExpertMeta = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

