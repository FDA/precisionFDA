import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsEverybodyPage } from './index'


describe('HomeExecutionsEverybodyPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionsEverybodyPage />)

    expect(component).toMatchSnapshot()
  })
})
