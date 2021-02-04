import React from 'react'
import { shallow } from 'enzyme'

import Counters from './Counters'


describe('Counters test', () => {
  it('should render', () => {
    const data = {
      currentPage: 2,
      nextPage: 3,
      totalCount: 4,
      count: 5,
    }
    const component = shallow(<Counters data={data} />)
    expect(component).toMatchSnapshot()
  })
})
