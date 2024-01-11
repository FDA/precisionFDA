import styled from 'styled-components'
import { colors } from '../../../styles/theme'


export const StyledFileBox = styled.div`
  font-size: 14px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  background: ${colors.subtleBlue};
  margin-top: 14px;
  min-width: 1024px;
`

export const FileHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #DDDDDD;
`

export const FileName = styled.span`
  display: flex;
  align-items: center;
  font-size: 24px;
`

export const FileDescription = styled.div`
  font-size: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  white-space: pre-line;
`
export const StyledTagContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
`
export const FileHeaderRight = styled.div`
  display: flex;
  justify-content: flex-end;
`
export const Middle = styled.div`
  width: 100%;
`
