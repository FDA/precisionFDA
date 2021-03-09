import React from 'react'
import { shallow } from 'enzyme'

import ArchiveContents from './index'


describe('ArchiveContents', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<ArchiveContents />)

    expect(wrapper).toMatchSnapshot()
  })
})
