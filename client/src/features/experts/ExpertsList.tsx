import { format } from 'date-fns'
import queryString from 'query-string'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { hidePagination, Pagination } from '../../components/Pagination'
import {
  ButtonRow,
  Content,
  ItemBody,
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
  Title,
} from '../../components/Public/styles'
import { usePaginationParams } from '../../hooks/usePaginationState'
import NavigationBar from '../../views/components/NavigationBar/NavigationBar'
import PublicLayout from '../../views/layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { expertsYearsListRequest } from './api'
import { ExpertsCondensedList } from './ExpertsCondensedList/ExpertsCondensedList'
import {
  useExpertsListQuery,
} from './useExpertsListQuery'
import { PageContainerMargin } from '../../components/Page/styles'
import { usePageMeta } from '../../hooks/usePageMeta'

export const ExpertListItem = styled.div`
  display: flex;
  gap: 32px;
`

export const ItemImage = styled.div`
  img {
    width: 156px;
    height: 156px;
    border-radius: 50%;
  }
`
export const ExpertImageCircleSmall = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
`

export const ExpertRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  width: fit-content;
`

export const Name = styled.div`
  font-weight: bold;
  color: #333333;
`

export const Info = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: #646464;
`

export const ExpertButtonRowWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`
export const ExpertButtonRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  width: fit-content;
  margin-top: 16px;
`

export const StyledCondensedList = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`
export const ExpertMeta = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

const ExpertsList = () => {
  usePageMeta({ title: 'Experts - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateExpert = user?.can_administer_site
  const location = useLocation()
  const { year }: any = queryString.parse(location.search)

  const pagination = usePaginationParams()

  const { data, isLoading, isFetched } = useExpertsListQuery({
    year,
    page: pagination.pageParam,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery(['experts-years'], expertsYearsListRequest, {
    onError: err => {
      console.log(err)
    },
  })

  return (
    <PublicLayout>
      <NavigationBar
        title="Experts Blog"
        subtitle="Insights from academic, industry, and FDA experts from the precisionFDA Community."
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
              <PageFilterTitle>Expert Highlights</PageFilterTitle>
              {year && <PageFilterTitle>{year}</PageFilterTitle>}
              <PageList>
                {data?.experts?.length === 0 && (
                  <div>There are no experts.</div>
                )}
                {data?.experts?.map(n => (
                  <ExpertListItem key={n.id}>
                    <ItemImage>
                      <img width="100%" src={n.image} alt="sf" />
                    </ItemImage>
                    <ItemBody>
                      <Title>{n.meta.blogTitle}</Title>
                      <Info>
                        <Name>{n.meta.title}</Name>
                        {format(new Date(n.createdAt), 'MMM dd, yyyy')}
                      </Info>
                      <Content>{n.meta.blogPreview}</Content>
                      <ExpertButtonRowWrap>
                        <ExpertButtonRow>
                          <Button
                            onClick={() =>
                              window.location.assign(`/experts/${n.id}/qa`)
                            }
                          >
                            Expert Q&amp;A
                          </Button>
                          <Link to={`/experts/${n.id}`} data-turbolinks="false">
                            <span
                              aria-label={`Click to view more information about ${n.meta.title}`}
                            >
                              ☆ About This Expert
                            </span>
                          </Link>
                          <Link to={`/experts/${n.id}/blog`} data-turbolinks="false">
                            <span
                              aria-label={`Click to read ${n.meta.title}'s blog post`}
                            >
                              Read Expert Blog Post &#x2197;
                            </span>
                          </Link>
                        </ExpertButtonRow>
                        {user?.admin && (
                          <ExpertButtonRow>
                            <Button
                              as="a"
                              data-turbolinks="false"
                              href={`/experts/${n.id}/edit`}
                              aria-label={`Click here to Edit the Expert ${n.id}`}
                            >
                              <span className="fa fa-pencil" />
                              Edit Expert
                            </Button>
                            <Button
                              as="a"
                              data-turbolinks="false"
                              href={`/experts/${n.id}/dashboard`}
                              aria-label={`Click here to View ${n.id}'s Dashboard`}
                            >
                              <span className="fa fa-dashboard fa-fw" />
                              Dashboard
                            </Button>
                          </ExpertButtonRow>
                        )}
                      </ExpertButtonRowWrap>
                    </ItemBody>
                  </ExpertListItem>
                ))}
                <Pagination
                  showPerPage={false}
                  page={data?.meta?.current_page}
                  totalCount={data?.meta?.total_count}
                  totalPages={data?.meta?.total_pages}
                  isHidden={hidePagination(
                    isFetched,
                    data?.experts?.length,
                    data?.meta?.total_pages,
                  )}
                  isPreviousData={data?.meta?.prev_page !== null}
                  isNextData={data?.meta?.next_page !== null}
                  setPage={n => pagination.setPageParam(n, 'replaceIn')}
                  onPerPageSelect={n =>
                    pagination.setPerPageParam(n, 'replaceIn')
                  }
                />
              </PageList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateExpert && (
              <RightSideItem>
                <ButtonRow>
                  <ButtonSolidBlue
                    as="a"
                    data-turbolinks="false"
                    href="/experts/new"
                  >
                    Add an expert
                  </ButtonSolidBlue>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Previous expert blogs</SectionTitle>
              <RightList>
                <ItemButton as={Link} to="/experts" selected={!year} data-turbolinks="false">
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    ?.map(y => y?.toString() || null)
                    .map((y, i) => (
                      <ItemButton
                        as={Link}
                        to={`/experts?year=${y}`}
                        data-turbolinks="false"
                        key={i}
                        selected={y === year}
                      >
                        {y}
                      </ItemButton>
                    ))}
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Experts</SectionTitle>
              <ExpertsCondensedList />
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default ExpertsList
