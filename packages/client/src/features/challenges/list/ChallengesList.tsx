import { useQuery, useQueryClient } from '@tanstack/react-query'
import queryString from 'query-string'
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../../components/Page/styles'
import { hidePagination, Pagination } from '../../../components/Pagination'
import {
  ButtonRow,
  ItemButton,
  PageFilterTitle,
  PageList,
  PageLoaderWrapper,
  PageMainBody,
  PageRow,
  RightListNext,
  RightSide,
  RightSideItem,
  SectionTitle,
} from '../../../components/Public/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { usePaginationParamsV2 } from '../../../hooks/usePaginationState'
import { useToastWSHandler } from '../../../hooks/useToastWSHandler'
import PublicLayout from '../../../layouts/PublicLayout'
import { DEFAULT_RECONNECT_ATTEMPTS, DEFAULT_RECONNECT_INTERVAL, getNodeWsUrl, SHOULD_RECONNECT } from '../../../utils/config'
import { useAuthUser } from '../../auth/useAuthUser'
import { Notification, NOTIFICATION_ACTION, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage } from '../../home/types'
import { challengesYearsListRequest } from '../api'
import { getTimeStatusName, renderEmpty } from '../util'
import { ChallengeListItem } from './ChallengeListItem'
import { useChallengesListQuery } from './useChallengesListQuery'
import styled from 'styled-components'
import { TimeStatus } from '../types'

const HeroContent = styled.div`
  text-align: center;
`

const HeroSubtitle = styled.p`
  font-size: clamp(1.02rem, 2.125vw, 1.19rem);
  color: var(--tertiary-700);
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`

const ContentSection = styled.section`
  margin-bottom: 50px;
`

const SectionSubtitle = styled.p`
  text-align: center;
  color: var(--tertiary-600);
  font-size: 1.2rem;
  max-width: 750px;
  margin: 0 auto 40px;
`

const FeatureLink = styled.a`
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 600;
`

const ChallengesList = () => {
  usePageMeta({ title: 'Challenges - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateChallenge = user?.can_create_challenges
  const location = useLocation()
  const {
    'filter[status]': timeStatus,
    'filter[year]': year,
  }: {
    'filter[status]'?: TimeStatus
    'filter[year]'?: string
  } = queryString.parse(location.search)

  const queryClient = useQueryClient()

  const pagination = usePaginationParamsV2()

  const { data, isLoading, isFetched } = useChallengesListQuery({
    year,
    timeStatus,
    page: pagination.pageParam,
    pageSize: pagination.pageSizeParam,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery({
    queryKey: ['challenges-years'],
    queryFn: () => challengesYearsListRequest(),
  })

  useToastWSHandler()

  const { lastJsonMessage } = useWebSocket<WebSocketMessage>(getNodeWsUrl(), {
    share: true,
    reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
    reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
    shouldReconnect: () => SHOULD_RECONNECT,
    filter: message => {
      try {
        const messageData = JSON.parse(message.data)
        const notification = messageData.data as Notification
        return (
          messageData.type === WEBSOCKET_MESSAGE_TYPE.NOTIFICATION &&
          NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED === notification.action
        )
      } catch (e: unknown) {
        console.error('Error parsing WebSocket message:', e)
        return false
      }
    },
  })

  useEffect(() => {
    if (lastJsonMessage == null) {
      return
    }
    queryClient.invalidateQueries({
      queryKey: ['challengesList'],
    })
  }, [lastJsonMessage])

  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar
        title={user ? 'Challenges' : ' '} // intended empty string with a space
        subtitle={
          user ? 'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.' : undefined
        }
        user={user}
      />
      <PageContainerMargin>
        <PageRow>
          {isLoading || !data?.data ? (
            <PageLoaderWrapper>
              <Loader />
            </PageLoaderWrapper>
          ) : (
            <PageMainBody>
              {!user ? <ChallengesLanding /> : null}
              {timeStatus && <PageFilterTitle>{getTimeStatusName(timeStatus)}</PageFilterTitle>}
              {year && <PageFilterTitle>{year}</PageFilterTitle>}
              <PageList>
                {data?.data?.length === 0 && renderEmpty(timeStatus)}
                {data?.data?.map(n => <ChallengeListItem key={n.id} challenge={n} />)}
                <Pagination
                  showPerPage={false}
                  perPage={pagination.pageSizeParam}
                  page={data?.meta?.page}
                  totalCount={data?.meta?.total}
                  totalPages={data?.meta?.totalPages}
                  isHidden={hidePagination(isFetched, data?.data?.length, data?.meta?.total)}
                  setPage={p => pagination.setPageParam(p, 'replaceIn')}
                  onPerPageSelect={pagination.setPageSizeParam}
                />
              </PageList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateChallenge && (
              <RightSideItem>
                <ButtonRow>
                  <Button data-variant="primary" as={Link} to="/challenges/create" data-turbolinks="false">
                    Create a new challenge
                  </Button>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Filter Challenges</SectionTitle>
              <RightListNext>
                <ItemButton as={Link} to="/challenges" selected={!timeStatus} data-turbolinks="false">
                  All
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
                  as={Link}
                  to="/challenges?filter[status]=current"
                  selected={timeStatus === 'current'}
                >
                  Currently Open
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
                  as={Link}
                  to="/challenges?filter[status]=upcoming"
                  selected={timeStatus === 'upcoming'}
                >
                  Upcoming
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
                  as={Link}
                  to="/challenges?filter[status]=ended"
                  selected={timeStatus === 'ended'}
                >
                  Ended
                </ItemButton>
              </RightListNext>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Previous Challenges</SectionTitle>
              <RightListNext>
                <ItemButton as={Link} to="/challenges" selected={!year} data-turbolinks="false">
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    ?.map(y => y.toString())
                    .map(y => (
                      <ItemButton
                        data-turbolinks="false"
                        as={Link}
                        to={`/challenges?filter[year]=${y}`}
                        key={y}
                        selected={y === year}
                        // onClick={() => handleYearPress(y)}
                      >
                        {y}
                      </ItemButton>
                    ))}
              </RightListNext>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Other Challenges</SectionTitle>
              <a href="/challenges/app-a-thon-in-a-box" data-turbolinks="false">
                App-a-thon in a Box &rarr;
              </a>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Propose a Challenge</SectionTitle>
              <div>
                If you have an idea, an objective, a dataset, an algorithm, or any combination of the above that you would like to
                put in front of the precisionFDA expert community.
              </div>
              <Link data-turbolinks="false" to="/challenges/propose">
                Propose a Challenge &rarr;
              </Link>
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

const ChallengesLanding = () => {
  return (
    <PageContainerMargin>
      <HeroContent>
        <HeroSubtitle>
          precisionFDA Challenges invite FDA employees and members of the scientific community to participate in optimizing
          innovative bioinformatics, real-world data, and AI solutions to advance regulatory science.
        </HeroSubtitle>
      </HeroContent>

      <ContentSection>
        <SectionSubtitle>
          To learn more about the public health issues and needs the Challenges aim to address, read our{' '}
          <FeatureLink href="/experts">Expert Blogs</FeatureLink>.
        </SectionSubtitle>
      </ContentSection>
    </PageContainerMargin>
  )
}

export default ChallengesList
