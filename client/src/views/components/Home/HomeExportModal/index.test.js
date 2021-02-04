import React from 'react'
import { shallow } from 'enzyme'

import HomeExportModal from './index'


describe('HomeExportModal', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<HomeExportModal />)

    expect(wrapper).toMatchSnapshot()
  })
})
