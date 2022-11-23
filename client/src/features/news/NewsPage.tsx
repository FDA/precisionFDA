import { format, parseISO } from 'date-fns'
import queryString from 'query-string'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { ButtonSolidBlue } from '../../components/Button'
import { Loader } from '../../components/Loader'
import { PageContainerMargin } from '../../components/Page/styles'
import { hidePagination, Pagination } from '../../components/Pagination'
import {
  ButtonRow,
  Content,
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
import { usePageMeta } from '../../hooks/usePageMeta'
import { usePaginationParams } from '../../hooks/usePaginationState'
import ExternalLink from '../../views/components/Controls/ExternalLink'
import NavigationBar from '../../views/components/NavigationBar/NavigationBar'
import PublicLayout from '../../views/layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { newsYearsListRequest } from './api'
import {
  ItemBody,
  ItemDate,
  NewsListItem,
} from './styles'
import { useNewsListQuery } from './useNewsListQuery'

const NewsPage = () => {
  usePageMeta({ title: 'News - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateNews = user && user.can_administer_site
  const location = useLocation()
  const query = queryString.parse(location.search)
  const pagination = usePaginationParams()

  const { data, isLoading, isFetched } = useNewsListQuery({
    year: query.year as string,
    page: pagination.pageParam,
    perPage: pagination.perPageParam,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery(['news-years'], () => newsYearsListRequest(), {
    onError: err => {
      console.log(err)
    },
  })

  return (
    <PublicLayout>
      <NavigationBar
        title="News"
        subtitle="Announcements and press for precisionFDA."
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
              {query.year && <PageFilterTitle>{query.year}</PageFilterTitle>}
              <PageList>
                {data?.news_items?.map(n => (
                  <NewsListItem key={n.id}>
                    <ItemDate>
                      {format(parseISO(n.created_at), 'MMM dd, yyyy')}
                    </ItemDate>
                    <ItemBody>
                      <Title>{n.title}</Title>
                      <Content>{n.content}</Content>
                      {n.video && (
                        <div style={{ marginBottom: '6px' }}>
                          <iframe
                            title="external video"
                            width="auto"
                            height="auto"
                            src={n.video}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <div>
                        <ExternalLink to={n.link}>
                          View News Source &rarr;
                        </ExternalLink>
                      </div>
                    </ItemBody>
                  </NewsListItem>
                ))}
                <Pagination
                  page={data?.meta?.current_page}
                  totalCount={data?.meta?.total_count}
                  totalPages={data?.meta?.total_pages}
                  isHidden={hidePagination(
                    isFetched,
                    data?.news_items?.length,
                    data?.meta?.total_pages,
                  )}
                  isPreviousData={data?.meta?.prev_page !== null}
                  isNextData={data?.meta?.next_page !== null}
                  setPage={n => {
                    pagination.setPageParam(n, 'replaceIn')
                  }}
                />
              </PageList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateNews && (
              <RightSideItem>
                <ButtonRow>
                  <ButtonSolidBlue
                    onClick={() => window.location.assign('/admin/news/new')}
                  >
                    New article
                  </ButtonSolidBlue>
                  <ButtonSolidBlue
                    onClick={() => window.location.assign('/admin/news')}
                  >
                    Administer News
                  </ButtonSolidBlue>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>News Backlog</SectionTitle>
              <RightList>
                <ItemButton selected={!query.year} as={Link} to="/news" data-turbolinks="false">
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    ?.map(y => y.toString())
                    .map(y => (
                      <ItemButton
                        data-turbolinks="false"
                        as={Link}
                        key={y}
                        to={`/news?year=${y}`}
                        selected={y.toString() === query.year?.toString()}
                      >
                        {y}
                      </ItemButton>
                    ))}
              </RightList>
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Community News</SectionTitle>
              If you have newsworthy updates of value to the precisionFDA
              community, let us know!
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default NewsPage
