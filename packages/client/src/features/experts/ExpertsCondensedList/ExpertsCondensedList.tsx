import React from 'react'
import { Link } from 'react-router-dom'
import { Loader } from '../../../components/Loader'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { usePaginationState } from '../../../hooks/usePaginationState'
import { pluralize } from '../../../utils/formatting'
import { ExpertImageCircleSmall, ExpertMeta, ExpertRow, StyledCondensedList } from './styles'
import { useExpertsListCondensedQuery } from '../useExpertsListQuery'

export const ExpertsCondensedList = ({ pick }: { pick?: number }) => {
  const pagination = usePaginationState()
  const { data, isLoading, isFetched } = useExpertsListCondensedQuery({
    page: pagination.page,
  })

  if (isLoading) return <Loader />
  const expertsList = pick ? data?.experts.slice(0, pick) : data?.experts
  const showPagination = !pick

  return (
    <StyledCondensedList>
      {expertsList?.map(e => (
        <ExpertRow key={e.id}>
          <Link to={`/experts/${e.id}`} data-turbolinks="false">
            <ExpertImageCircleSmall src={e.image} />
          </Link>
          <div>
            <Link to={`/experts/${e.id}`} data-turbolinks="false">{e.meta.title}</Link>
            <ExpertMeta>
              <div>
                {e.meta.totalAnswerCount || 0}{' '}
                {pluralize('Answer', e.meta.totalAnswerCount || 0)}{' '}
              </div>
              <div>
                {e.meta.totalCommentCount || 0}{' '}
                {pluralize('Comment', e.meta.totalCommentCount || 0)}
              </div>
            </ExpertMeta>
          </div>
        </ExpertRow>
      ))}
      {showPagination && <Pagination
        showPerPage={false}
        showPageOf={false}
        showPageJump={false}
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
        setPage={n => pagination.setPage(n)}
      />}
      
    </StyledCondensedList>
  )
}
