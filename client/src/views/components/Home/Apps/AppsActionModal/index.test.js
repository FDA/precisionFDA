import React from 'react'
import { shallow } from 'enzyme'

import { AppsActionModal } from '.'


describe('AppsActionModal test', () => {
  it('should render', () => {
    const component = shallow(<AppsActionModal />)

    expect(component).toMatchSnapshot()
  })
})
