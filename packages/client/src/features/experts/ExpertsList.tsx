import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import queryString from 'query-string'
import { Link, useLocation } from 'react-router'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { LightBulbIcon } from '../../components/icons/LightBulbIcon'
import { Loader } from '../../components/Loader'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../components/Page/styles'
import { Pagination } from '../../components/Pagination'
import {
  ButtonRow,
  Content,
  ItemBody,
  ItemButton,
  PageFilterTitle,
  PageList,
  PageLoaderWrapper,
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
import { expertsYearsListRequest } from './api'
import { ExpertsCondensedList } from './ExpertsCondensedList/ExpertsCondensedList'
import { useExpertsListQuery } from './useExpertsListQuery'

export const ExpertListItem = styled.div`
  display: flex;
  gap: 32px;
`

export const ItemImage = styled.div`
  img {
    min-width: 156px;
    height: 156px;
    border-radius: 10%;
  }
`

export const Name = styled.div`
  font-weight: bold;
  color: var(--c-text-700);
`

export const Info = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: var(--c-text-500);
`

export const ExpertButtonRowWrap = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`

export const ExpertButtonRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  width: fit-content;
  margin-top: 16px;
`

const ExpertsList = () => {
  usePageMeta({ title: 'Experts - precisionFDA' })
  const user = useAuthUser()
  const userCanCreateExpert = user?.can_administer_site
  const location = useLocation()
  const { year } = queryString.parse(location.search)

  const pagination = usePaginationParamsV2()

  const { data: response, isLoading } = useExpertsListQuery({
    year: parseInt(year as string, 10) || undefined,
    page: pagination.pageParam,
  })
  const { data: yearsListData, isLoading: isLoadingYearsList } = useQuery({
    queryKey: ['experts-years'],
    queryFn: expertsYearsListRequest,
  })

  return (
    <PublicLayout mainScroll={!!user}>
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
            <div>
              <PageFilterTitle>Expert Highlights</PageFilterTitle>
              {year && <PageFilterTitle>{year}</PageFilterTitle>}
              <PageList>
                {response?.data.length === 0 && <div>There are no experts.</div>}
                {response?.data.map(n => (
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
                            title={`Click here to View ${n.meta.title}'s Q&A`}
                            onClick={() => window.location.assign(`/experts/${n.id}/qa`)}
                          >
                            Expert Q&amp;A
                          </Button>
                          <Link to={`/experts/${n.id}`} data-turbolinks="false">
                            <span aria-label={`Click to view more information about ${n.meta.title}`}>
                              ☆ About This Expert
                            </span>
                          </Link>
                          <Link to={`/experts/${n.id}/blog`} data-turbolinks="false">
                            <span aria-label={`Click to read ${n.meta.title}'s blog post`}>
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
                              title={`Click here to Edit the Expert ${n.meta.title}`}
                            >
                              <span className="fa fa-pencil" />
                              Edit Expert
                            </Button>
                            <Button
                              as="a"
                              data-turbolinks="false"
                              href={`/experts/${n.id}/dashboard`}
                              title={`Click here to View ${n.meta.title}'s Dashboard`}
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
                  page={response?.meta?.page}
                  totalCount={response?.meta?.total}
                  totalPages={response?.meta?.totalPages}
                  isHidden={false}
                  setPage={n => pagination.setPageParam(n, true)}
                  onPerPageSelect={n => pagination.setPageSizeParam(n)}
                />
              </PageList>
            </div>
          )}
          <RightSide>
            {userCanCreateExpert && (
              <RightSideItem>
                <ButtonRow>
                  <Button data-variant="primary" as="a" data-turbolinks="false" href="/experts/new">
                    <LightBulbIcon height={14} /> Create Expert
                  </Button>
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
