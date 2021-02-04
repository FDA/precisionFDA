import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsEverybodyTable } from '.'


describe('HomeExecutionsEverybodyTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsEverybodyTable />)

    expect(component).toMatchSnapshot()
  })
})
