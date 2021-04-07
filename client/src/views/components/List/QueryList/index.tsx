import React, { FunctionComponent } from 'react'
import classNames from 'classnames/bind'
import { UseQueryResult } from 'react-query'

import Loader from '../../Loader'
import './style.sass'
import { IListItem } from '../../../../types/listItem'


interface IQueryListProps<T extends IListItem> {
  query: () => UseQueryResult<any, Error>,
  listExtractor: (queryResult: any) => T[],
  template: (item: T) => React.ReactNode
}

const QueryList: FunctionComponent<IQueryListProps<any>> = ({ query, listExtractor, template }: IQueryListProps<IListItem>) => {
  const classes = classNames(['query-list'])

  const { status, error, data } = query()

  if (error) {
    return (
      <div>{error.message}</div>
    )
  }

  if (status == 'loading') {
    return (
      <div className='text-center'>
        <Loader />
      </div>
    )
  }

  if (data) { 
    const items = listExtractor(data)
    return (
      <ul className={classes}>
        {items.map((item: IListItem) =>
          template(item)
        )}
      </ul>
    )
  }

  return <div></div>
}

export {
  QueryList,
}

export default QueryList
