import React from 'react'
import { shallow } from 'enzyme'

import { HomeMoveModal } from './index'


describe('HomeMoveModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeMoveModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
