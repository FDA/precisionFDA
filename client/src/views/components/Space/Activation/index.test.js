import React from 'react'
import { shallow } from 'enzyme'

import { Activation } from './index'


describe('<Activation />', () => {
  it('renders', () => {
    const wrapper = shallow(<Activation onAcceptClick={() => {}} space={{}} />)

    expect(wrapper).toMatchSnapshot()
  })
})
