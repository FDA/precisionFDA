import React from 'react'

import { IYearListPayload } from '../../../../api/yearList'
import { UseQueryResult } from 'react-query'
import QueryList from '../QueryList'
import './style.sass'


interface IYearListProps {
  elementName: string,
  query: () => UseQueryResult<IYearListPayload, Error>,
  setYearHandler: (year: number) => void,
}

class YearList extends React.Component<IYearListProps> {
  static defaultProps = {
    elementName: 'years',
    query: () => {},
    setYearHandler: () => {},
  }

  render() {
    const { elementName, query, setYearHandler } = this.props
    const className = 'year-list'
    const emptyMessage = 'No previous ' + elementName
    const listExtractor = (payload: IYearListPayload) => {
      return payload.yearList
    }
    const ItemTemplate = (year: number) => {
      return (
        <li key={year}>
          <a onClick={() => setYearHandler(year)}>{year}</a>
        </li>
      )
    }
  
    return <QueryList query={query} listExtractor={listExtractor} template={ItemTemplate} emptyMessage={emptyMessage} className={className} />
  }
}

export {
  YearList,
}
