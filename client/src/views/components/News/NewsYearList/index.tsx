import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import Loader from '../../Loader'
import {
  fetchNewsYearList,
} from '../../../../actions/news'
import {
  newsYearListSelector,
  newsYearListIsFetchingSelector,
} from '../../../../reducers/news/yearList/selectors'
import './style.sass'
import { YearList } from '../../List/YearList'


class NewsYearList extends YearList {
  static defaultProps = {
    elementName: 'news',
    years: [],
    isFetching: false,
    setYearHandler: () => {},
    fetchYearList: () => {},
  }
}

const mapStateToProps = (state: any) => ({
  years: newsYearListSelector(state),
  isFetching: newsYearListIsFetchingSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  fetchYearList: () => dispatch(fetchNewsYearList()),
})

export {
  NewsYearList
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsYearList)
