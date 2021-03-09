import React from 'react'
import { shallow } from 'enzyme'

import { HomeFilesEverybodyTable } from '.'


describe('HomeFilesEverybodyTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeFilesEverybodyTable />)

    expect(component).toMatchSnapshot()
  })
})
