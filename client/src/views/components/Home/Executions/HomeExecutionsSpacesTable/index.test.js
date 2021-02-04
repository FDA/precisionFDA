import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsSpacesTable } from '.'


describe('HomeExecutionsSpacesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsSpacesTable />)

    expect(component).toMatchSnapshot()
  })
})
