import React from 'react'
import { shallow } from 'enzyme'

import { HomeLicenseModal } from './index'


describe('HomeLicenseModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeLicenseModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
