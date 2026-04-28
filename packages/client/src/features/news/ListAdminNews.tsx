import React from 'react'
import { format } from 'date-fns'
import { Link, Navigate, useSearchParams } from 'react-router'
import { Tooltip } from 'react-tooltip'
import styled, { css } from 'styled-components'
import { Button, TransparentButton } from '@/components/Button'
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon'
import { GlobeIcon } from '@/components/icons/GlobeIcon'
import { NewspaperIcon } from '@/components/icons/NewspaperIcon'
import { Svg } from '@/components/icons/Svg'
import { Loader } from '@/components/Loader'
import { BackLink } from '@/components/Page/PageBackLink'
import { PageContainerMargin, PageTitle } from '@/components/Page/styles'
import { useAuthUser } from '@/features/auth/useAuthUser'
import ExternalLink from '../../components/Controls/ExternalLink'
import { ButtonRow } from '../modal/styles'
import { NewsItem } from './types'
import { useNewsAdminAllRequest } from './useNewsListQuery'

const StyledCard = styled.div`
  display: flex;
  justify-content: space-between;
  border: 1px solid var(--c-layout-border-200);
  gap: 12px;
  padding: 16px;
  flex: 1;
  background-color: var(--tertiary-50);
  align-items: center;
`

const PageHeader = styled.div`
  width: 100%;
  flex: 1 0 auto;
  padding-top: 32px;

  ${PageTitle} {
    margin: 16px 0;
  }
`

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1 0 auto;
  width: 100%;
`

const CardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`
const CardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  ${Svg} {
    transform: rotate(180deg);
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 4px;
`

const DateText = styled.div`
  white-space: nowrap;
`

const NewsPageContainerMargin = styled(PageContainerMargin)`
  --container-width: 800px;
  padding-bottom: 64px;
`

const StyledTip = styled.div<{ enabled: boolean }>`
  ${props => !props.enabled && 'opacity: 0.3;'}
`

const TypeSelect = styled(TransparentButton)<{ selected: boolean }>`
  padding: 4px 8px;
  display: flex;
  align-items: center;
  ${props =>
    props.selected &&
    css`
      background-color: var(--primary-500);
      color: white;
    `}
`

const TipIcon = ({
  infoText,
  enabled,
  children,
}: {
  enabled: boolean
  infoText: string
  children: React.ReactNode
}) => {
  return (
    <StyledTip enabled={enabled} data-tooltip-content={infoText} data-tooltip-id="news-list-tips">
      {children}
    </StyledTip>
  )
}

export function SortableItem({ id, newsItem }: { id: number; newsItem: NewsItem }) {
  return (
    <StyledCard>
      <CardLeft>
        <Link to={`/account/admin/news/${id}/edit`}>{newsItem.title}</Link>
      </CardLeft>
      <CardRight>
        <TipIcon infoText={newsItem.isPublication ? 'Publication' : 'Article'} enabled={newsItem.isPublication}>
          <NewspaperIcon />
        </TipIcon>
        <TipIcon infoText={newsItem.published ? 'Published' : 'Not Published'} enabled={newsItem.published}>
          <GlobeIcon />
        </TipIcon>
        {newsItem.createdAt ? <DateText>{format(new Date(newsItem.createdAt), 'MM/dd/yyyy')}</DateText> : null}
        {newsItem.link ? (
          <ExternalLink to={newsItem.link}>
            <ArrowLeftIcon />
          </ExternalLink>
        ) : null}
      </CardRight>
    </StyledCard>
  )
}

function ListAdminNews() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const { data, isLoading } = useNewsAdminAllRequest({ type: typeParam })

  const setType = (type: string | null) => {
    if (type) {
      searchParams.set('type', type)
    } else {
      searchParams.delete('type')
    }
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <NewsPageContainerMargin>
      <PageHeader>
        <BackLink linkTo="/news">Back to news list</BackLink>
        <PageTitle>Admin News Items</PageTitle>
        <Row>
          <Link to="/account/admin/news/create">
            <Button data-variant="primary">Add News Item</Button>
          </Link>
          <ButtonRow>
            <TypeSelect selected={!typeParam} onClick={() => setType(null)}>
              All
            </TypeSelect>
            <TypeSelect selected={typeParam === 'publication'} onClick={() => setType('publication')}>
              Publications
            </TypeSelect>
            <TypeSelect selected={typeParam === 'article'} onClick={() => setType('article')}>
              Articles
            </TypeSelect>
          </ButtonRow>
        </Row>
      </PageHeader>

      <StyledList>
        {isLoading ? <Loader /> : (data as NewsItem[])?.map(i => <SortableItem key={i.id} id={i.id} newsItem={i} />)}
        {!isLoading && (data as NewsItem[])?.length === 0 && <div>No news items found</div>}
      </StyledList>
      <Tooltip id="news-list-tips" />
    </NewsPageContainerMargin>
  )
}

const IsAdminWrapper = () => {
  const user = useAuthUser()
  if (!user) return <div />
  if (!user?.admin) {
    return <Navigate to="/news" replace />
  }
  return <ListAdminNews />
}

export default IsAdminWrapper
