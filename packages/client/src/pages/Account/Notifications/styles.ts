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
  font-weight: 900;
  letter-spacing: 0.05em;
  margin-top: 2rem;
  font-size: 16px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`
export const SectionTitleSmall = styled.h3`
  color: var(--c-text-500);
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-top: 12px;
  font-size: 14px;
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

export const NotificationSectionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  max-width: 100%;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 769px) and (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`

export const NotificationSectionColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`
