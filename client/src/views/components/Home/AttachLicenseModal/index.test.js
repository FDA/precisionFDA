import React from 'react'
import { shallow } from 'enzyme'

import { AttachLicenseModal } from './index'


describe('AttachLicenseModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<AttachLicenseModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
