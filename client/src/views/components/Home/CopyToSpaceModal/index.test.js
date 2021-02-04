import React from 'react'
import { shallow } from 'enzyme'

import { CopyToSpaceModal } from './index'


describe('CopyToSpaceModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<CopyToSpaceModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
