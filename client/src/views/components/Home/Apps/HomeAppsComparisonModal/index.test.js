import React from 'react'
import { shallow } from 'enzyme'

import { HomeAppsComparisonModal } from '.'


describe('HomeAppsComparisonModal test', () => {
  it('should render', () => {
    const component = shallow(<HomeAppsComparisonModal />)

    expect(component).toMatchSnapshot()
  })
})
