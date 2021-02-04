import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetsFeaturedTable } from '.'


describe('HomeAssetsFeaturedTable test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetsFeaturedTable />)

    expect(component).toMatchSnapshot()
  })
})
