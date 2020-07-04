import React from 'react'
import { shallow } from 'enzyme'

import Counter from './Counter'


describe('<Counter />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Counter type={'member'} counter={100} />)

    expect(wrapper).toMatchSnapshot()
  })
})
