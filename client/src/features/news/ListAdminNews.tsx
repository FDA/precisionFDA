import { format } from 'date-fns'
import React from 'react'
import { Link, Redirect } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { ButtonSolidBlue, TransparentButton } from '../../components/Button'
import { ButtonGroup } from '../../components/Button/ButtonGroup'
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon'
import { GlobeIcon } from '../../components/icons/GlobeIcon'
import { NewspaperIcon } from '../../components/icons/NewspaperIcon'
import { Svg } from '../../components/icons/Svg'
import { Loader } from '../../components/Loader'
import { BackLink } from '../../components/Page/PageBackLink'
import { PageContainerMargin } from '../../components/Page/styles'
import ExternalLink from '../../components/Controls/ExternalLink'
import { UserLayout } from '../../layouts/UserLayout'
import { useAuthUserQuery } from '../auth/api'
import { NewsItem } from './types'
import { useNewsAdminAllRequest } from './useNewsListQuery'

const StyledCard = styled.div`
  display: flex;
  justify-content: space-between;
  border: 1px solid #777;
  gap: 12px;
  padding: 16px;
  flex: 1;
  background-color: white;
  align-items: center;
`

const PageHeader = styled.div`
  width: 100%;
  flex: 1 0 auto;
  padding-top: 32px;
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

const ButtonRow = styled.div`
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

const TypeSelect = styled(TransparentButton)<{ selected: boolean}>`
  padding: 4px 8px;
  display: flex;
  align-items: center;
  ${props => props.selected && 'background-color: #eee;'}
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
    <StyledTip enabled={enabled} data-tip={infoText} data-for="news-list-tips">
      {children}
    </StyledTip>
  )
}

export function SortableItem({
  id,
  newsItem,
}: {
  id: number
  newsItem: NewsItem
}) {
  return (
    <StyledCard>
      <CardLeft>
        <Link to={`/admin/news/${id}/edit`}>{newsItem.title}</Link>
      </CardLeft>
      <CardRight>
        <TipIcon
          infoText={newsItem.isPublication ? 'Publication' : 'Article'}
          enabled={newsItem.isPublication}
        >
          <NewspaperIcon />
        </TipIcon>
        <TipIcon
          infoText={newsItem.published ? 'Published' : 'Not Published'}
          enabled={newsItem.published}
        >
          <GlobeIcon />
        </TipIcon>
        {newsItem.createdAt ? (
          <DateText>
            {format(new Date(newsItem.createdAt), 'MM/dd/yyyy')}
          </DateText>
        ) : (
          <div />
        )}
        {newsItem.link ? (
          <ExternalLink to={newsItem.link}>
            <ArrowLeftIcon />
          </ExternalLink>
        ) : (
          <div />
        )}
        <ReactTooltip id="news-list-tips" place="top" effect="solid" />
      </CardRight>
    </StyledCard>
  )
}

function ListAdminNews() {
  const [typeParam, setTypeParam] = useQueryParam('type', StringParam)
  const { data, isLoading } = useNewsAdminAllRequest({ type: typeParam })

  return (
    <UserLayout>
      <NewsPageContainerMargin>
        <PageHeader>
          <BackLink linkTo="/news">Back to news list</BackLink>
          <h1>Admin News Items</h1>
          <ButtonRow>
            <Link to="/admin/news/create">
              <ButtonSolidBlue>Add News Item</ButtonSolidBlue>
            </Link>
            <ButtonGroup>
              <TypeSelect selected={!typeParam} onClick={() => setTypeParam(null, 'replaceIn')}>
                All
              </TypeSelect>
              <TypeSelect selected={typeParam === 'publication'}
                onClick={() => setTypeParam('publication', 'replaceIn')}
              >
                Publications
              </TypeSelect>
              <TypeSelect selected={typeParam === 'article'} onClick={() => setTypeParam('article', 'replaceIn')}>
                Articles
              </TypeSelect>
            </ButtonGroup>
          </ButtonRow>
        </PageHeader>

        <StyledList>
          {isLoading ? (
            <Loader />
          ) : (
            data!.map(i => <SortableItem key={i.id} id={i.id} newsItem={i} />)
          )}
          {data?.length === 0 && <div>No news items found</div>}
        </StyledList>
      </NewsPageContainerMargin>
    </UserLayout>
  )
}

const IsAdminWrapper = () => {
  const { data } = useAuthUserQuery()
  if (!data?.user) return <div />
  if (!data?.user.admin) {
    return <Redirect to="/news" />
  }
  return <ListAdminNews />
}

export default IsAdminWrapper
