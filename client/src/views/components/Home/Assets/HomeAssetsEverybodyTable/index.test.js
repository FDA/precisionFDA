import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsEverybodyTable } from '.'


describe('HomeAssetsEverybodyTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsEverybodyTable />)

    expect(component).toMatchSnapshot()
  })
})
