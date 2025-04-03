import styled from 'styled-components'
import { PageContainer, pagePadding } from '../../../components/Page/styles'

export const StyledNotifications = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 32px;
  gap: 4px;
`

export const FieldGroup = styled.fieldset`
  display: flex;
  border: none;
  gap: 4px;

  label {
    margin-left: 5px;
  }
`

export const SectionTitle = styled.h2`
  color: var(--c-text-500);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-top: 12px;
  font-size: 16px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`

export const StyledSelectWrap = styled.div`
  width: 400px;
  margin-bottom: 20px;
`

export const StyledPageContainer = styled(PageContainer)`
  ${pagePadding}
  flex-direction: column;
`
