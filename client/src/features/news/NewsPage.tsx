import { format } from 'date-fns'
import React from 'react'
import { NumberParam, StringParam, useQueryParams } from 'use-query-params'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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
import ExternalLink from '../../components/Controls/ExternalLink'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'
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
  const pagination = usePaginationParams()
  const [query, setQuery] = useQueryParams({ year: StringParam, type: StringParam })

  const { data, isLoading, isFetched } = useNewsListQuery({
    year: query.year,
    type: query.type,
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
              {!isLoading && data?.news_items?.length === 0 && (
                <div>No news items. Try changing the filter.</div>
              )}
              {data?.news_items?.length > 0 && query.year && <PageFilterTitle>{query.year}</PageFilterTitle>}
              <PageList>
                {data?.news_items?.map(n => (
                  <NewsListItem key={n.id}>
                    <ItemDate>
                      {format(new Date(n.createdAt), 'MMM dd, yyyy')}
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
                            src={n.video.replace('/watch?v=', '/embed/')}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <div>
                        <ExternalLink to={n.link}>
                          View {n.isPublication ? 'Publication' : 'Article'} &rarr;
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
                  <ButtonSolidBlue as={Link} to="/admin/news">
                    Administer News
                  </ButtonSolidBlue>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Filter News</SectionTitle>
              <RightList>
                <ItemButton selected={!query.type} onClick={() => setQuery({ type: null }, 'replaceIn')}>
                  All
                </ItemButton>
                <ItemButton selected={query.type === 'publication'} onClick={() => setQuery({ type: 'publication' }, 'replaceIn')}>
                  Publications
                </ItemButton>
                <ItemButton selected={query.type === 'article'} onClick={() => setQuery({ type: 'article' }, 'replaceIn')}>
                  Articles
                </ItemButton>
              </RightList>
            </RightSideItem>

            <RightSideItem>
              <SectionTitle>By Year</SectionTitle>
              <RightList>
                <ItemButton selected={!query.year}  onClick={() => setQuery({ year: null }, 'replaceIn')}>
                  All
                </ItemButton>
                {!isLoadingYearsList &&
                  yearsListData
                    .map(y => (
                      <ItemButton
                        key={y}
                        onClick={() => setQuery({ year: y }, 'replaceIn')}
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
