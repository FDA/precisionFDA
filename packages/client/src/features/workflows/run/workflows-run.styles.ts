import styled from 'styled-components'
import { colors } from '../../../styles/theme'

export const Topbox = styled.div` 
  background: ${colors.subtleBlue};
`

export const WorkflowConfiguration = styled.div`
`

export const StyledForm = styled.form`
`

export const SectionHeader = styled.div`
  padding: 20px 15px;
  border-bottom: 1px solid transparent;
  color: #333333;
  background-color: #f5f5f5;
  border-color: #ddd;
    border-top-color: rgb(221, 221, 221);
    border-right-color: rgb(221, 221, 221);
    border-bottom-color: rgb(221, 221, 221);
    border-left-color: rgb(221, 221, 221);
`

export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 16px;
`

export const Section = styled.div`
  margin-bottom: 20px;
  border-radius: 3px;
  border: 1px solid transparent;
  border-color: #ddd;
`

export const StyledLine = styled.div`
  display: flex;
  flex-direction: row;
`

export const StyledAnalysisName = styled.div`
  flex-grow: 1;
`

export const StyledStageHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
  background-color: ${colors.stageBlue};
`
