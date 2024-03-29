import queryString from 'query-string'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { ButtonSolidBlue } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
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
  RightList,
  RightSide,
  RightSideItem,
  SectionTitle,
} from '../../../components/Public/styles'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { usePaginationParams } from '../../../hooks/usePaginationState'
import NavigationBar from '../../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../../layouts/PublicLayout'
import { useAuthUser } from '../../auth/useAuthUser'
import { challengesYearsListRequest } from '../api'
import { getTimeStatusName, renderEmpty } from '../util'
import { ChallengeListItem } from './ChallengeListItem'
import { useChallengesListQuery } from './useChallengesListQuery'


const ChallengesList = () => {
  usePageMeta({ title: 'Challenges - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateChallenge = user?.can_create_challenges
  const location = useLocation()
  const { year, time_status }: any = queryString.parse(location.search)

  const pagination = usePaginationParams()

  const { data, isLoading, isFetched } = useChallengesListQuery({
    year,
    time_status,
    page: pagination.pageParam,
    perPage: pagination.perPageParam,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery(['challenges-years'], () => challengesYearsListRequest(), {
    onError: err => {
      console.log(err)
    },
  })



  return (
    <PublicLayout>
      <NavigationBar
        title="Challenges"
        subtitle="Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science."
        user={user}
      />
      <PageContainerMargin>
        <PageRow>
          {isLoading ? (
            <PageLoaderWrapper>
              <Loader />
            </PageLoaderWrapper>
          ) : (
            <PageMainBody>
              {time_status && (
                <PageFilterTitle>
                  {getTimeStatusName(time_status)}
                </PageFilterTitle>
              )}
              {year && <PageFilterTitle>{year}</PageFilterTitle>}
              <PageList>
                {data?.challenges.length === 0 && renderEmpty(time_status)}
                {data?.challenges?.map(n => (
                  <ChallengeListItem key={n.id} challenge={n} />
                ))}
                <Pagination
                  showPerPage={false}
                  page={data?.meta?.current_page}
                  totalCount={data?.meta?.total_count}
                  totalPages={data?.meta?.total_pages}
                  isHidden={hidePagination(
                    isFetched,
                    data?.challenges?.length,
                    data?.meta?.total_pages,
                  )}
                  isPreviousData={data?.meta?.prev_page !== null}
                  isNextData={data?.meta?.next_page !== null}
                  setPage={pagination.setPageParam}
                  onPerPageSelect={pagination.setPerPageParam}
                />
              </PageList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateChallenge && (
              <RightSideItem>
                <ButtonRow>
                  <ButtonSolidBlue as={Link} to="/challenges/create" data-turbolinks="false">
                    Create a new challenge
                  </ButtonSolidBlue>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Filter Challenges</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/challenges" selected={!time_status} data-turbolinks="false">
                  All
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
                  as={Link}
                  to="/challenges?time_status=current"
                  selected={time_status === 'current'}
                >
                  Currently Open
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
                  as={Link}
                  to="/challenges?time_status=upcoming"
                  selected={time_status === 'upcoming'}
                >
                  Upcoming
                </ItemButton>
                <ItemButton
                  data-turbolinks="false"
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
              <a href="/challenges/app-a-thon-in-a-box" data-turbolinks="false">
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
              <Link data-turbolinks="false" to="/challenges/propose">Propose a Challenge &rarr;</Link>
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default ChallengesList
