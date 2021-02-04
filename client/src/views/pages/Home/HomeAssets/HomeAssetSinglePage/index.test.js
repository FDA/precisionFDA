import React from 'react'
import { shallow } from 'enzyme'

import { HomeAssetSinglePage } from './index'


describe('HomeAssetSinglePage test', () => {
  it('should render', () => {
    const component = shallow(<HomeAssetSinglePage />)

    expect(component).toMatchSnapshot()
  })
})
