import React from 'react'
import { shallow } from 'enzyme'

import NoFoundPage from '.'


describe('NoFoundPage test', () => {
  it('should render', () => {
    const component = shallow(<NoFoundPage />)
    expect(component).toMatchSnapshot()
  })
})
