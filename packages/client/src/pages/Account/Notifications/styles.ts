import styled from 'styled-components'
import { PageContainer, pagePadding } from '../../../components/Page/styles'
import { commonStyles } from '../../../styles/commonStyles'

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
  ${commonStyles.sectionHeading};
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
