import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesEverybodyPage } from './index'


describe('HomeFilesEverybodyPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesEverybodyPage />)

    expect(component).toMatchSnapshot()
  })
})
