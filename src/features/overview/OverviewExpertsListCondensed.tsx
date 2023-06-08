import { format } from 'date-fns'
import React from 'react'
import { Link } from 'react-router-dom'
import { Loader } from '../../components/Loader'
import { usePaginationState } from '../../hooks/usePaginationState'
import {
  CeatedAtDate,
  ExpertImageCircleSmall,
  ExpertRow,
  Name,
  StyledCondensedList,
  StyledPreview,
} from '../experts/ExpertsCondensedList/styles'
import { useExpertsListCondensedQuery } from '../experts/useExpertsListQuery'

export const OverviewExpertsCondensedList = ({ pick }: { pick?: number }) => {
  const pagination = usePaginationState()
  const { data, isLoading } = useExpertsListCondensedQuery({
    page: pagination.page,
  })

  if (isLoading) return <Loader displayInline />
  const expertsList = pick ? data?.experts.slice(0, pick) : data?.experts

  return (
    <StyledCondensedList>
      {expertsList?.map(e => (
        <ExpertRow key={e.id}>
          <Link to={`/experts/${e.id}`} data-turbolinks="false">
            <ExpertImageCircleSmall src={e.image} />
          </Link>
          <div>
            <Name>
              <Link to={`/experts/${e.id}`} data-turbolinks="false">
                {e.meta.title}
              </Link>
            </Name>
            <StyledPreview>{e.meta.blogPreview}</StyledPreview>
            <CeatedAtDate>
              {format(new Date(e.createdAt), 'MMM dd, yyyy')}
            </CeatedAtDate>
          </div>
        </ExpertRow>
      ))}
    </StyledCondensedList>
  )
}
