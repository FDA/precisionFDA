import React from 'react'
import { shallow } from 'enzyme'

import AboutPage from '.'


describe('AboutPage test', () => {
  it('should render', () => {
    const component = shallow(<AboutPage />)
    expect(component).toMatchSnapshot()
  })
})
