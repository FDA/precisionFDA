import React from 'react'
import { shallow } from 'enzyme'

import { NewSpaceForm } from './index'


describe('<NewSpaceForm/>', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<NewSpaceForm onCancelClick={() => {}} onCreateClick={() => {}} />)

    expect(wrapper).toMatchSnapshot()
  })
})
