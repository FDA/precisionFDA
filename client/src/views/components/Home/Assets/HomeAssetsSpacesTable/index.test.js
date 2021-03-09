import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsSpacesTable } from '.'


describe('HomeAssetsSpacesTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsSpacesTable />)

    expect(component).toMatchSnapshot()
  })
})
