import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import { ExpertsListItem, ExpertsListItemType } from '../ExpertsListItem'
import { IExpert } from '../../../shapes/ExpertShape'
import { IPagination } from '../../../shapes/IPagination'
import Pagination from '../../TableComponents/Pagination'
import Loader from '../../Loader'
import {
  fetchExperts,
  expertsListSetPage,
} from '../../../../actions/experts'
import {
  expertsListItemsSelector,
  expertsListIsFetchingSelector,
  expertsListPaginationSelector
} from '../../../../reducers/experts/list/selectors'
import './style.sass'
import { contextUserSelector } from '../../../../reducers/context/selectors'


interface IExpertsListProps {
  listItemType?: ExpertsListItemType,
  experts?: IExpert[],
  isFetching?: boolean,
  pagination?: IPagination | undefined,
  setPageHandler?: (page: number) => void,
  user: any,
}


const ExpertsList: FunctionComponent<IExpertsListProps> = ({ experts=[], isFetching=false, pagination=undefined, setPageHandler=() => {}, listItemType=ExpertsListItemType.BlogEntry, user=undefined }: IExpertsListProps) => {
  const classes = classNames(['experts-list'])

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
    return (
      <div>
        <ul className={classes}>
          {experts.map((expert) => <ExpertsListItem type={listItemType} key={expert.id} expert={expert} userCanEdit={userCanEdit(expert)} />)}
        </ul>
        <Pagination data={pagination} setPageHandler={setPageHandler} />
      </div>
    )
  }

  return <div className='text-center'>No experts found.</div>
}

ExpertsList.defaultProps = {
  listItemType: ExpertsListItemType.BlogEntry,
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
