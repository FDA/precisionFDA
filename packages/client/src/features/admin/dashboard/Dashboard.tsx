import styled from 'styled-components'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserLayout } from '../../../layouts/UserLayout'
import { AdminIcon } from '../../../components/icons/AdminIcon'
import { UsersIcon } from '../../../components/icons/UsersIcon'
import { BullsEyeIcon } from '../../../components/icons/BullsEyeIcon'
import { commonStyles } from '../../../styles/commonStyles'
import { ChartColumnIcon } from '../../../components/icons/ChartColumnIcon'
import { BellIcon } from '../../../components/icons/BellIcon'
import LinkButton from './LinkButton'
import { HandshakeIcon } from '../../../components/icons/HandshakeIcon'
import { ChartLineIcon } from '../../../components/icons/ChartLineIcon'
import { NewspaperIcon } from '../../../components/icons/NewspaperIcon'
import { colors, fontWeight } from '../../../styles/theme'
import { fetchAdminStats } from '../admin.api'
import { Loader } from '../../../components/Loader'


const PageHeader = styled.div`
  margin: 0;
  padding: 20px 16px;
  background-color: ${colors.subtleBlue};
  color: ${colors.darkGreyOnGrey};
  border-bottom: 1px solid ${colors.shadedBg};
`

export const TopLeft = styled.div`
  ${commonStyles.pageTitle};
  display: flex;
  align-items: center;
  gap: 8px;
`

const Infoframe = styled.div`
  background-color: ${colors.subtleBlue};
  outline-offset: -15px;
  outline: 1px solid ${colors.textLightGrey};
  padding: 19px 30px 20px;
`

const InfoframeTitle = styled.h4`
    position: relative;
    top: -0.8em;
    margin-left: 0em;
    display: inline;
    background-color: ${colors.subtleBlue};
    padding-top: 5px;
    padding-left: 5px;
    padding-right: 5px;
`

const InfoTable = styled.table`
  border: 1px solid ${colors.textLightGrey};
  margin-bottom: 10px;
  border-spacing: 0px;
`

const InfoTableTh = styled.th`
  padding: 6px 15px 4px;
  background-color: white;
  text-transform: uppercase;
  color: ${colors.inactiveBlue};
  font-weight: ${fontWeight.light};
  border-right: 1px solid ${colors.textLightGrey};
`

const InfoTableTd = styled.td`
  background-color: white;
  padding: 2px 15px 6px;
  margin-bottom: 0;
  line-height: 1.3;
  border-right: 1px solid ${colors.textLightGrey};
`

const ButtonBar = styled.div`
  display: flex;
  gap: 3px;
`

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: () => fetchAdminStats(),
  })

  return (
    <UserLayout mainScroll>
      <PageHeader>
        <TopLeft>
          <ChartColumnIcon height={30} />Admin Dashboard
        </TopLeft>
      </PageHeader>
      <Infoframe>
          <InfoframeTitle>Site administration</InfoframeTitle>
          <InfoTable>
            <thead>
              <tr>
                <InfoTableTh>Contributors</InfoTableTh>
                <InfoTableTh>Contributor orgs</InfoTableTh>
              </tr>
            </thead>
            <tbody>
            <tr>
              <InfoTableTd>
                {isLoading ? (
                  <Loader height={6} />
                ) : (data?.usersCount)}
              </InfoTableTd>
              <InfoTableTd>
                {isLoading ? (
                  <Loader height={6} />
                ) : (data?.orgsCount)}
              </InfoTableTd>
            </tr>
            </tbody>
          </InfoTable>
          <ButtonBar>
            <LinkButton to='/admin/users' icon={<UsersIcon height={12} />} label='Users' />
            <LinkButton nonReact to='/admin/admin_memberships?group=site' icon={<AdminIcon height={12} />} label='Admins' />
            <LinkButton nonReact to='/admin/sidekiq' icon={<ChartColumnIcon height={12} />} label='Sidekiq' />
            <LinkButton nonReact to='/admin/comparator_settings' icon={<BullsEyeIcon height={12} />} label='Comparator Settings' />
            <LinkButton to='/admin/alerts' icon={<BellIcon height={12} />} label='Site Alerts' />
          </ButtonBar>
      </Infoframe>
      <Infoframe>
        <InfoframeTitle>Site activity</InfoframeTitle>
        <ButtonBar>
          <LinkButton nonReact to='/admin/activity_reports' icon={<ChartLineIcon height={12} />} label='Site Activity reporting' />
          <LinkButton nonReact to='/admin/pending_users' icon={<UsersIcon height={12} />} label='Pending Users' />
          <LinkButton nonReact to='/admin/org_action_requests' icon={<UsersIcon height={12} />} label='Organizations Action Requests' />
          <LinkButton to='/admin/news' icon={<NewspaperIcon height={12} />} label='News' />
          <LinkButton nonReact to='/admin/participants' icon={<HandshakeIcon height={12} />} label='Participants' />
        </ButtonBar>
      </Infoframe>
    </UserLayout>
  )
}
