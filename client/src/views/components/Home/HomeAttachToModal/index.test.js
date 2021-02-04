import React from 'react'
import { shallow } from 'enzyme'

import { HomeAttachToModal } from './index'


describe('HomeAttachToModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeAttachToModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
