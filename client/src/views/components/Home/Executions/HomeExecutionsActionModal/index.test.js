import React from 'react'
import { shallow } from 'enzyme'

import { HomeExecutionsActionModal } from './index'


describe('HomeExecutionsActionModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeExecutionsActionModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
