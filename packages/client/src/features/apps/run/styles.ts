import styled from 'styled-components'
import { InputText } from '../../../components/InputText'

export const AppsConfiguration = styled.div`
`

export const TipsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  color: var(--c-text-600);
  text-align: left;
`

export const StyledLabel = styled.div`
  display: flex;
  font-size: 14px;
  font-weight: 500;
`
export const StyledMaxRuntime = styled.div`
  font-size: 12px;
`

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 15px;
  border-bottom: 1px solid transparent;
  background-color: var(--c-layout-border-200);
  border-color: var(--c-layout-border-200);
`

export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 24px;
`

export const Section = styled.div`
  margin-bottom: 32px;
  border-radius: 3px;
  border: 1px solid transparent;
  border-color: var(--c-layout-border-200);
`

export const Topbox = styled.div` 
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 32px 0;
`

export const TopboxItem = styled.div`
`

export const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`

export const InputTextRightMargin = styled(InputText)`
  flex-grow: 1;
  margin-right: 16px;
`

export const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  width: 100%;
`

export const StyledJobName = styled.div`
  flex-grow: 1;
`

export const StyledInstanceType = styled.div`
  padding-left: 23px;
`

export const StyledForm = styled.form`
  padding-bottom: 64px;
`

export const StyledWarning = styled.div`
  color: darkred;
  font-size: 14px;
`

export const WrapSingleField = styled.div`
  display: flex;
  max-width: 500px;
  font-size: 14px;
  flex-direction: row;
`

export const StyledLine = styled.div`
  display: flex;
  flex-direction: row;
`

export const RemoveButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--c-text-600);;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 5%;

  &:hover {
    background-color: var(--tertiary-100);
  }

  &:focus {
    outline: none;
  }
`

export const StyledActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const RightGroup = styled.div`
  display: flex;
  gap: 16px; 
`