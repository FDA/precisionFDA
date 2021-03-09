import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesPage } from './index'


describe('HomeFilesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesPage />)

    expect(component).toMatchSnapshot()
  })
})
