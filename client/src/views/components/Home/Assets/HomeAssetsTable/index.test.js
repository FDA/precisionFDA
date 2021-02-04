import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsTable } from '.'


describe('HomeAssetsTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsTable />)

    expect(component).toMatchSnapshot()
  })
})
