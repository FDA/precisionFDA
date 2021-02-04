import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsTable } from '.'


describe('HomeExecutionsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsTable />)

    expect(component).toMatchSnapshot()
  })
})
