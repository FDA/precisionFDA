import styled from 'styled-components'
import { StyledBackLink } from '../../../components/Page/PageBackLink'
import { PageContainerMargin, PageTitle } from '../../../components/Page/styles'

export const FormPageContainer = styled(PageContainerMargin)`
  --container-width: 600px;

  ${StyledBackLink} {
    margin: 16px 0;
  }

  ${PageTitle} {
    margin: 16px 0;
  }
`