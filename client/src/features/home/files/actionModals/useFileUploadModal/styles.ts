import styled from 'styled-components'
import { Svg } from '../../../../../components/icons/Svg'
import { colors } from '../../../../../styles/theme'

export const Row = styled.tr`
  display: flex;
`
export const Title = styled.div`
  font-size: 18px;
  color: ${colors.textDarkGrey};
`
export const SubTitle = styled.div`
  font-size: 16px;
  color: ${colors.textDarkGrey};
`
export const Remove = styled.th`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  ${Svg} {
    cursor: pointer;
  }
`
export const Status = styled.th`
  padding-right: 12px;
  padding-left: 12px;
  width: 80px;
  text-align: right;
`

export const StyledDropSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 8px;
  border-bottom: 1px solid #e5e5e5;
`

export const StyledUploadInfoSection = styled.div`
  display: flex;
  justify-content: space-between;
`
export const UploadFilesTable = styled.table`
  padding: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  thead {
    tr {
      font-weight: bold;
    }
    th {
      text-align: left;
    }
  }
  td {
    padding-top: 4px;
    padding-bottom: 4px;
  }
`
export const StyledFileItem = styled.div`
  display: flex;
  justify-content: space-between;
`