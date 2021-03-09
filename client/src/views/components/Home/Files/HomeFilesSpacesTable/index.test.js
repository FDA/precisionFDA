import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesSpacesTable } from '.'


describe('HomeFilesSpacesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesSpacesTable />)

    expect(component).toMatchSnapshot()
  })
})
