import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StringParam, useQueryParams } from 'use-query-params'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import { PageContainerMargin } from '../../components/Page/styles'
import { PageList, PageMainBody, PageRow } from '../../components/Public/styles'
import { usePageMeta } from '../../hooks/usePageMeta'
import PublicLayout from '../../layouts/PublicLayout'
import { useAuthUser } from '../auth/useAuthUser'
import { searchRequest } from './api'
import { SearchResult } from './types'

const NewsPage = () => {
  const user = useAuthUser()
  const query = useQueryParams({ query: StringParam })[0].query

  if (!query) {
    return (
      <PublicLayout mainScroll={!!user}>
        <NavigationBar title="Search results" user={user} />
        <PageContainerMargin>
          <PageRow>
            <PageMainBody>
              <h1>Please enter a search query.</h1>
            </PageMainBody>
          </PageRow>
        </PageContainerMargin>
      </PublicLayout>
    )
  }

  usePageMeta({ title: query ? `Search: ${query} - precisionFDA` : 'Search - precisionFDA' })

  const { data: challenges } = useQuery({
    queryKey: ['search-challenges', query],
    queryFn: () =>
      searchRequest({ query, entityType: 'challenge' }).catch(err => {
        if (err && err.message) toast.error(err.message)
      }),
  })

  const { data: experts } = useQuery({
    queryKey: ['search-experts', query],
    queryFn: () =>
      searchRequest({ query, entityType: 'expert' }).catch(err => {
        if (err && err.message) toast.error(err.message)
      }),
  })

  const { data: questions } = useQuery({
    queryKey: ['search-questions', query],
    queryFn: () =>
      searchRequest({ query, entityType: 'expertQuestion' }).catch(err => {
        if (err && err.message) toast.error(err.message)
      }),
  })

  const ResultRow = ({ item }: { item: SearchResult }) => (
    <>
      Title: {item.title}
      <br />
      Description: {item.description}
      <br />
      <Link to={item.link}> link</Link>
    </>
  )

  return (
    <PublicLayout mainScroll={!!user}>
      <NavigationBar title="Search results" user={user} />
      <PageContainerMargin>
        hello search! Query: {query}
        <PageRow>
          <PageMainBody>
            <PageList>
              <h2>Challenges</h2>
              {challenges?.map(ch => <ResultRow item={ch} key={ch.link} />)}
              <h2>Expert blogs</h2>
              {experts?.map(e => <ResultRow item={e} key={e.link} />)}
              <h2>Q&A</h2>
              {questions?.map(q => <ResultRow item={q} key={q.link} />)}
            </PageList>
          </PageMainBody>
        </PageRow>
      </PageContainerMargin>
    </PublicLayout>
  )
}

export default NewsPage
