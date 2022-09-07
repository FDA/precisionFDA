import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'

import { ExpertsListItem, ExpertsListItemBlogEntry } from '../ExpertsListItem'
import { IExpert } from '../../../../types/expert'
import { IPagination } from '../../../../types/pagination'
import Pagination from '../../TableComponents/Pagination'
import Loader from '../../Loader'
import {
  fetchExperts,
  expertsListSetPage,
} from '../../../../actions/experts'
import {
  expertsListItemsSelector,
  expertsListIsFetchingSelector,
  expertsListPaginationSelector,
} from '../../../../reducers/experts/list/selectors'
import { StyledExpertsListContainer } from './styles'
import { contextUserSelector } from '../../../../reducers/context/selectors'


interface IExpertsListProps {
  listItemComponent?: typeof ExpertsListItem,
  experts?: IExpert[],
  isFetching?: boolean,
  filter?: (item: IExpert[]) => IExpert[],
  allowPagination?: boolean,
  pagination?: IPagination | undefined,
  setPageHandler?: (page: number) => void,
  user: any,
}


const ExpertsList: FunctionComponent<IExpertsListProps> = ({ experts=[], isFetching=false, filter, allowPagination=true, pagination=undefined, setPageHandler=() => {}, listItemComponent=ExpertsListItemBlogEntry, user=undefined }: IExpertsListProps) => {

  if (isFetching) {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  const isLoggedIn = user && Object.keys(user).length > 0
  const userCanEdit = (expert: IExpert) => {
    return isLoggedIn && (user.can_administer_site || user.id == expert.user_id)
  }

  if (experts.length) {
    let itemsToShow = experts
    if (filter) {
      itemsToShow = filter(experts)
    }

    const ListItem = listItemComponent

    return (
      <StyledExpertsListContainer>
        <ul className="experts-list">
          {itemsToShow.map((expert) => <ListItem key={expert.id} expert={expert} userCanEdit={userCanEdit(expert)} />)}
        </ul>
        {allowPagination &&
          <Pagination data={pagination} setPageHandler={setPageHandler} />
        }
      </StyledExpertsListContainer>
    )
  }

  return <div className='text-center'>No experts found.</div>
}

ExpertsList.defaultProps = {
  listItemComponent: ExpertsListItemBlogEntry,
  experts: [],
  isFetching: false,
  setPageHandler: () => {},
}

const mapStateToProps = (state: any) => ({
  experts: expertsListItemsSelector(state),
  isFetching: expertsListIsFetchingSelector(state),
  pagination: expertsListPaginationSelector(state),
  user: contextUserSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  setPageHandler: (page: number) => {
    dispatch(expertsListSetPage(page))
    dispatch(fetchExperts())
  },
})

export {
  ExpertsList,
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpertsList)
