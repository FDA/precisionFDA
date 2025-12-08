import React from 'react'
import { format } from 'date-fns'
import { Link, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../components/Button'
import ExternalLink from '../../components/Controls/ExternalLink'
import { InlineError } from '../../components/Error'
import { Loader } from '../../components/Loader'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
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
import { usePaginationParamsV2 } from '../../hooks/usePaginationState'
import PublicLayout from '../../layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { newsYearsListRequest } from './api'
import { ItemBody, ItemDate, NewsListItem } from './styles'
import { useNewsListQuery } from './useNewsListQuery'

const NewsPage = () => {
  usePageMeta({ title: 'News - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateNews = user && user.can_administer_site
  const [searchParams, setSearchParams] = useSearchParams()

  const query = {
    year: searchParams.get('year') || undefined,
    type: searchParams.get('type') || undefined,
  }

  const setQuery = (params: { year?: string | null; type?: string | null }) => {
    setSearchParams(
      prev => {
        const newParams = new URLSearchParams(prev)

        Object.entries(params).forEach(([key, value]) => {
          if (value === null || value === undefined) {
            newParams.delete(key)
          } else {
            newParams.set(key, value)
          }
        })
        
        // Reset to first page when filters change
        newParams.delete('page')

        return newParams
      },
      { replace: true },
    )
  }
  const pagination = usePaginationParamsV2()

  const { data, isLoading, isFetched } = useNewsListQuery({
    year: query.year,
    type: query.type,
    page: pagination.pageParam,
    pageSize: pagination.pageSizeParam,
  })
  const {
    data: yearsListData,
    isLoading: isLoadingYearsList,
    error: yearsListError,
  } = useQuery({
    queryKey: ['news-years'],
    queryFn: () => newsYearsListRequest(),
  })

  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar title="News" subtitle="Announcements and press for precisionFDA." user={user} />
      <PageContainerMargin>
        <PageRow>
          {isLoading ? (
            <PageLoaderWrapper>
              <Loader />
            </PageLoaderWrapper>
          ) : (
            <PageMainBody>
              {!isLoading && data?.data?.length === 0 && <div>No news items. Try changing the filter.</div>}
              {data?.data && data.data.length > 0 && query.year && <PageFilterTitle>{query.year}</PageFilterTitle>}
              <PageList>
                {data?.data?.map(n => (
                  <NewsListItem key={n.id}>
                    <ItemDate>{format(new Date(n.createdAt), 'MMM dd, yyyy')}</ItemDate>
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
                        <ExternalLink to={n.link}>View {n.isPublication ? 'Publication' : 'Article'} &rarr;</ExternalLink>
                      </div>
                    </ItemBody>
                  </NewsListItem>
                ))}
                <Pagination
                  page={data?.meta?.page}
                  perPage={data?.meta?.pageSize}
                  totalCount={data?.meta?.total}
                  totalPages={data?.meta?.totalPages}
                  isHidden={hidePagination(isFetched, data?.data?.length, data?.meta?.totalPages)}
                  onPerPageSelect={pagination.setPageSizeParam}
                  setPage={n => {
                    pagination.setPageParam(n, true) // true = replace
                  }}
                />
              </PageList>
            </PageMainBody>
          )}
          <RightSide>
            {userCanCreateNews && (
              <RightSideItem>
                <ButtonRow>
                  <Button data-variant="primary" as={Link} to="/admin/news">
                    Administer News
                  </Button>
                </ButtonRow>
              </RightSideItem>
            )}
            <RightSideItem>
              <SectionTitle>Filter News</SectionTitle>
              <RightList>
                <ItemButton selected={!query.type} onClick={() => setQuery({ type: null })}>
                  All
                </ItemButton>
                <ItemButton selected={query.type === 'publication'} onClick={() => setQuery({ type: 'publication' })}>
                  Publications
                </ItemButton>
                <ItemButton selected={query.type === 'article'} onClick={() => setQuery({ type: 'article' })}>
                  Articles
                </ItemButton>
              </RightList>
            </RightSideItem>

            <RightSideItem>
              <SectionTitle>By Year</SectionTitle>
              {yearsListError ? (
                <InlineError />
              ) : (
                <RightList>
                  <ItemButton selected={!query.year} onClick={() => setQuery({ year: null })}>
                    All
                  </ItemButton>
                  {!isLoadingYearsList &&
                    yearsListData?.map(y => (
                      <ItemButton
                        key={y}
                        onClick={() => setQuery({ year: y })}
                        selected={y.toString() === query.year?.toString()}
                      >
                        {y}
                      </ItemButton>
                    ))}
                </RightList>
              )}
            </RightSideItem>
            <RightSideItem>
              <SectionTitle>Community News</SectionTitle>
              If you have newsworthy updates of value to the precisionFDA community, let us know!
            </RightSideItem>
          </RightSide>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default NewsPage
