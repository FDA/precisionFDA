import React from 'react'
import { shallow } from 'enzyme'

import { SpacesListPage } from '.'


describe('SpacesListPage test', () => {
  it('should render', () => {
    const component = shallow(<SpacesListPage />)
    expect(component).toMatchSnapshot()
  })
})
