import styled, { css } from 'styled-components'
import { FieldGroup } from '../../../components/form/styles'
import { PfTab } from '../../../components/Tabs/PfTab'


export const TopFieldGroup = styled(FieldGroup)`
  flex: 1;
  max-width: 400px;
  min-width: 270px;
` 

export const TopFieldGroupUbuntu = styled(TopFieldGroup)`
  max-width: 200px;
  min-width: 100px;
` 

export const StyledForm = styled.form`
  margin: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1360px;
`

export const SubmitRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const FormSectionTop = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

export const TabRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  border-bottom: 1px solid var(--c-layout-border);
`

export const TabTitle = styled.div`
  color: var(--c-text-500);
  text-transform: uppercase;
  font-size: 14px;
`

export const TabDesc = styled.div`
  color: var(--tertiary-400);
  font-size: 12px;
  line-height: 1.428571429;
`

export const StyledPfTab = styled(PfTab)<{ $isActive: boolean }>`
  text-align: left;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 2px;

  ${({ $isActive }) =>
    $isActive &&
    css`
      ${TabTitle} {
        color: var(--c-text-700);
      }
    `}
`

export const TableStyles = styled.div`
  display: flex;
  margin-top: 12px;
  margin-left: 12px;
  input[type="checkbox"] {
    margin: 3px 4px;
  }
  table {
    border-collapse: separate;
    text-indent: initial;
    border-spacing: 2px;
    font-size: 14px;
    flex: 1;
    th {
      text-align: left;
    }
    td, th {
      padding: 1px;
    }
  }
`

export const InputRow = styled.div`
  max-width: 300px;
  display: flex;
`

export const SectionTitleRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid;
  padding: 6px;
  padding-left: 12px;
  color: var(--c-text-700);
  background-color: var(--tertiary-70);
  border-color: var(--c-layout-border-200);
  `

export const StyledInputOutputBox = styled.div`
  max-width: 1357px;
  margin-top: 20px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  background-color: var(--tertiary-50);
  border: 1px solid var(--c-layout-border-200);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.05);
  font-size: 14px;
`

export const SectionTitle = styled.div`
  font-size: 19px;
  font-weight: 600;
  display: flex;
`

export const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

export const StyledClassTd = styled.td`
  width: 96px;
  input {
    font-size: 12px;
    text-transform: uppercase;
  }
`

export const StyledRemove = styled.div`
  justify-content: flex-end;
  display: flex;
  margin-left: 12px;
  margin-right: 12px;

  button {
    padding: 3px;
    min-width: 16px;
    svg {
      width: 16px;
    }
  }
`

export const Help = styled.div`
  padding: 6px;
  padding-right: 12px;
  border-left: 5px solid var(--tertiary-200);
  color: #777777;
  text-align: left;
  font-size: 13px;
  line-height: 24px;
  width: fit-content;
`
