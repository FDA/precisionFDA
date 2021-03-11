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


interface INewsYearListProps {
  years: number[],
  isFetching: boolean,
  setYearHandler: (year: number) => void,
  fetchYearList: () => void,
}


class NewsYearList extends React.Component<INewsYearListProps> {
  static defaultProps = {
    years: [],
    isFetching: false,
    setYearHandler: () => {},
    fetchYearList: () => {},
  }

  componentDidMount() {
    const { fetchYearList } = this.props
    fetchYearList()
  }

  render() {
    const { years, isFetching, setYearHandler } = this.props
    const classes = classNames(['news-year-list'])
    const heading = "PREVIOUS NEWS"

    if (isFetching) {
      return (
        <div>
          <div className="pfda-subsection-heading">{heading}</div>
          <div className='text-center'>
            <Loader />
          </div>
        </div>
      )
    }

    if (!years) {
      return (
        <div>
          <div className="pfda-subsection-heading">{heading}</div>
          <div className='text-center'>
            No previous news
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className="pfda-subsection-heading">{heading}</div>
        <ul className={classes}>
          {years.map((year: number) => (
            <li key={year}>
              <a onClick={() => setYearHandler(year)}>{year}</a>
            </li>
          ), this)}
        </ul>
      </div>
    )
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
