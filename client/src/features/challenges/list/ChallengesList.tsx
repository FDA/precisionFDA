import { format } from 'date-fns'
import queryString from 'query-string'
import React from 'react'
import { useQuery } from 'react-query'
import { Link, useLocation } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { hidePagination, Pagination } from '../../../components/Pagination'
import {
  ButtonRow,
  Container,
  Content,
  ItemBody,
  ItemButton,
  NewsList,
  NewsLoaderWrapper,
  PageFilterTitle,
  PageMainBody,
  PageRow,
  RightList,
  RightSide,
  RightSideItem,
  SectionTitle,
  Title,
} from '../../../components/Public/styles'
import { usePaginationParams } from '../../../hooks/usePaginationState'
import { colors } from '../../../styles/theme'
import NavigationBar from '../../../views/components/NavigationBar/NavigationBar'
import PublicLayout from '../../../views/layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { challengesYearsListRequest } from '../api'
import { DateArea, ViewDetailsButton } from '../styles'
import { TimeStatus } from '../types'
import { getChallengeTimeRemaining, getTimeStatus } from '../util'
import { useChallengesListQuery } from './useChallengesListQuery'

export const ChallengeListItem = styled.div`
  display: flex;
  gap: 32px;
`

const statusCss = css`
  display: block;
  position: absolute;
  padding: 2px 4px;
  color: white;
  font-weight: bold;
  font-size: 12px;
`
export const ItemImage = styled.div<{ timeStatus: TimeStatus }>`
  min-width: 200px;
  max-width: 200px;

  ${props => {
    if (props.timeStatus === 'current')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.highlightGreen};
          content: 'OPEN';
        }
      `
    if (props.timeStatus === 'upcoming')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.darkYellow};
          content: 'UPCOMING';
        }
      `
    if (props.timeStatus === 'ended')
      return css`
        &:before {
          ${statusCss}
          background: ${colors.darkGreyOnGrey};
          content: 'ENDED';
        }
      `
    return null
  }}
`

export const ChallengesList = () => {
  const user = useAuthUser()
  const userCanCreateChallenge = user?.can_create_challenges
  const location = useLocation()
  const { year, time_status }: any = queryString.parse(location.search)

  const pagination = usePaginationParams()

  const { data, isLoading, isFetched } = useChallengesListQuery({
    year,
    time_status,
    pagination,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery(
    'challenges-years',
    () => challengesYearsListRequest(),
    {
      onError: err => {
        console.log(err)
      },
    },
  )

  const renderEmpty = () => {
    switch (time_status) {
      case 'current':
      case 'upcoming':
        return `There are no ${time_status} challenges on precisionFDA at the moment.  Check back regularly or subscribe to the mailing list to be informed of new community challenges.`
      case 'ended':
        return 'No ended challenges.'
      default:
        return 'No challenges found.'
    }
  }

  const getTimeStatusName = (ts: TimeStatus) => {
    switch (ts) {
      case 'current':
        return 'Currently Open'
      case 'upcoming':
        return 'Upcoming'
      case 'ended':
        return 'Ended'
      default:
        return null
    }
  }

  return (
    <PublicLayout>
      <NavigationBar
        title="Challenges"
        subtitle="Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science."
        user={user}
      />
      <Container>
        <PageRow>
          {isLoading ? (
            <NewsLoaderWrapper>
              <Loader />
            </NewsLoaderWrapper>
          ) : (
            <PageMainBody>
              {time_status && (
                <PageFilterTitle>
                  {getTimeStatusName(time_status)}
                </PageFilterTitle>
              )}
              {year && <PageFilterTitle>{year}</PageFilterTitle>}
              <NewsList>
                {data?.challenges.length === 0 && renderEmpty()}
                {data?.challenges?.map(n => (
                  <ChallengeListItem key={n.id}>
                    <ItemImage timeStatus={getTimeStatus(n.start_at, n.end_at)}>
                      <img width="100%" src={n.card_image_url} alt="sf" />
                    </ItemImage>
                    <ItemBody>
                      <Title>{n.name}</Title>
                      <DateArea>
                        <span className="challenge-date-label">Starts</span>
                        <span className="challenge-date">
                          {format(n.start_at, 'MM/dd/yyyy')}
                        </span>
                        <span>&rarr;</span>
                        <span className="challenge-date-label">Ends</span>
                        <span className="challenge-date">
                          {format(n.end_at, 'MM/dd/yyyy')}{' '}
                        </span>
                        <div className="challenge-date-remaining">
                          {getChallengeTimeRemaining({
                            start_at: n.start_at,
                            end_at: n.end_at,
                          })}
                        </div>
                      </DateArea>
                      <Content>{n.description}</Content>
                      <div>
                        <ViewDetailsButton as={Link} to={`/challenges/${n.id}`}>
                          View Details &rarr;
                        </ViewDetailsButton>
                      </div>
                    </ItemBody>
                  </ChallengeListItem>
                ))}
                <Pagination
                  showPerPage={false}
                  page={data?.meta?.current_page}
                  totalCount={data?.meta?.total_count}
                  totalPages={data?.meta?.total_pages}
                  hide={hidePagination(
                    isFetched,
                    data?.challenges?.length,
                    data?.meta?.total_pages,
                  )}
                  isPreviousData={data?.meta?.prev_page !== null}
                  isNextData={data?.meta?.next_page !== null}
                  setPage={pagination.setPageParam}
                  onPerPageSelect={pagination.setPerPageParam}
                />
              </NewsList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateChallenge && (
              <RightSideItem>
                <ButtonRow>
                  <ButtonSolidBlue as={Link} to="/challenges/create">
                    Create a new challenge
                  </ButtonSolidBlue>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Filter Challenges</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/challenges" selected={!time_status}>
                  All
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=current"
                  selected={time_status === 'current'}
                >
                  Currently Open
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=upcoming"
                  selected={time_status === 'upcoming'}
                >
                  Upcoming
                </ItemButton>
                <ItemButton
                  as={Link}
                  to="/challenges?time_status=ended"
                  selected={time_status === 'ended'}
                >
                  Ended
                </ItemButton>
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Previous Challenges</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/challenges" selected={!year}>
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    ?.map(y => y.toString())
                    .map(y => (
                      <ItemButton
                        as={Link}
                        to={`/challenges?year=${y}`}
                        key={y}
                        selected={y === year}
                        // onClick={() => handleYearPress(y)}
                      >
                        {y}
                      </ItemButton>
                    ))}
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Other Challenges</SectionTitle>
              <a href="/challenges/app-a-thon-in-a-box">
                App-a-thon in a Box &rarr;
              </a>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Propose a Challenge</SectionTitle>
              <div>
                If you have an idea, an objective, a dataset, an algorithm, or
                any combination of the above that you would like to put in front
                of the precisionFDA expert community.
              </div>
              <Link to="/challenges/propose">Propose a Challenge &rarr;</Link>
            </RightSideItem>
          </RightSide>
        </PageRow>
      </Container>
    </PublicLayout>
  )
}
