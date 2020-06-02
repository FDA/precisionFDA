import React from 'react'
import { shallow } from 'enzyme'

import Pagination from './Pagination'


describe('SpacesListPage test', () => {
  it('should render', () => {
    const data = {
      currentPage: 10,
      nextPage: 9,
      prevPage: 11,
      totalPages: 16,
    }
    const component = shallow(< Pagination data={data} />)
    expect(component).toMatchSnapshot()
  })
})
