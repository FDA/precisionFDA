import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesSpacesPage } from './index'


describe('HomeFilesSpacesPage test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesSpacesPage />)

    expect(component).toMatchSnapshot()
  })
})
