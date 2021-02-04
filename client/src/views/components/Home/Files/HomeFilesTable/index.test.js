import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesTable } from '.'


describe('HomeFilesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesTable />)

    expect(component).toMatchSnapshot()
  })
})
