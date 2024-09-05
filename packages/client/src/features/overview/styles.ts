import styled from 'styled-components'
import { PageMainBody, SectionTitle } from '../../components/Public/styles'

export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
`

export const ViewAllButton = styled.div`
  width: 192px;
  text-align: left;
  border-top: 1px solid var(--primary-500);
  padding-top: 6px;
`

export const ExpertSection = styled.div`
  margin-bottom: 32px;
`

export const Hr = styled.div`
  border-bottom: 1px solid var(--c-layout-border);
  margin: 1rem 0;
`

export const CommunityParticipants = styled.div`
  background-color: var(--tertiary-100);
  margin: 0;
  margin-bottom: 64px;
  padding: 32px 0;
  text-align: center;
  color: var(--base);

  ${SectionTitle} {
    margin-bottom: 32px;
  }
`

export const PageOverviewMainBody = styled(PageMainBody)`
  flex-direction: column;
`
