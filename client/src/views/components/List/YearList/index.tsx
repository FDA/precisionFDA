import React from 'react'
import classNames from 'classnames/bind'

import Loader from '../../Loader'
import './style.sass'


interface IYearListProps {
  elementName: string,
  years: number[],
  isFetching: boolean,
  setYearHandler: (year: number) => void,
  fetchYearList: () => void,
}


class YearList extends React.Component<IYearListProps> {
  static defaultProps = {
    elementName: 'years',
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
    const { elementName, years, isFetching, setYearHandler } = this.props
    const classes = classNames(['year-list'])

    if (isFetching) {
      return (
        <div>
          <div className='text-center'>
            <Loader />
          </div>
        </div>
      )
    }

    if (!years) {
      return (
        <div>
          <div className='text-center'>
            No previous {elementName}
          </div>
        </div>
      )
    }

    return (
      <div>
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

export {
  YearList
}
