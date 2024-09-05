import styled from 'styled-components'

export const Row = styled.tr`
  display: flex;
`
export const Title = styled.div`
  font-size: 18px;
`
export const SubTitle = styled.div`
  font-size: 16px;
`
export const Remove = styled.th`
  padding: 4px 16px;
  button {
    min-height: 23px;
  }
`
export const Status = styled.th`
  padding: 4px 16px;
  width: 90px;
  text-align: left;
  vertical-align: top;
`
export const Name = styled.th`
  padding: 4px 16px;
  text-align: left;
  vertical-align: top;
  min-width: 260px;
`
export const StyledFileUploadStatus = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 25px;
  text-transform: capitalize;

  svg {
    flex-shrink: 0;
    width: 15px;
  }
`

export const StyledDropSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  gap: 8px;
`

export const StyledUploadInfoSection = styled.div`
  display: flex;
  justify-content: space-between;
`
export const UploadFilesTable = styled.table`
  margin-bottom: 1rem;
  width: 100%;
  thead {
    tr {
      font-weight: bold;
    }
    th {
      text-align: left;
      border-bottom: 1px solid var(--c-layout-border);
    }
  }
  td {
    padding-top: 4px;
    padding-bottom: 4px;
    
  }
  td, th {
    border-bottom: 1px solid var(--c-layout-border-200);
  }
`
export const StyledFileItem = styled.div`
  display: flex;
  justify-content: space-between;
`