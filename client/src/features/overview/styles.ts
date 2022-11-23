import styled from 'styled-components'
import { theme } from '../../styles/theme'
import { SectionTitle } from '../../components/Public/styles'

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
  border-top: 1px solid ${theme.colors.highlightBlue};
  padding-top: 6px;
`

export const ExpertSection = styled.div`
  margin-bottom: 32px;
`

export const CommunityParticipants = styled.div`
  background-color: ${theme.colors.subtleBlue};
  margin: 0;
  margin-bottom: 64px;
  padding: 32px 0;
  text-align: center;

  ${SectionTitle} {
    margin-bottom: 32px;
  }
`

export const PFDATeamSection = styled.div`
  background-color: ${theme.colors.subtleBlue};
  text-align: center;
  margin: 64px 0;
  padding: 32px 0;

  ${SectionTitle} {
    margin-bottom: 32px;
  }
`
