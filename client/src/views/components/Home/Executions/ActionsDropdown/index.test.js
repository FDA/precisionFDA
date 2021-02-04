import React from 'react'
import { shallow } from 'enzyme'

import { ActionsDropdown } from '.'


describe('ActionsDropdown test', () => {
  it('should render', () => {
    const component = shallow(<ActionsDropdown />)

    expect(component).toMatchSnapshot()
  })
})
