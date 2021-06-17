import styled from 'styled-components'
import { commonStyles } from '../../../../styles/commonStyles'


export const StyledChallengesListContainer = styled.div`
  margin-top: 12px;
  .challenges-list {
    ${commonStyles.listContainer}
  }

  .pfda-pagination {
    ${commonStyles.listPagination}
  }
`
