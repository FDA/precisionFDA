import React from 'react'
import { shallow } from 'enzyme'

import Icon from './index'


describe('<Icon />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Icon icon={'fa-user'} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('uses fw class if set', () => {
    const wrapper = shallow(<Icon icon={'fa-user'} fw={true}/>)

    expect(wrapper).toHaveClassName('fa-fw')
  })

  it('doesn\'t use fw class if not set', () => {
    const wrapper = shallow(<Icon icon={'fa-user'} fw={false}/>)

    expect(wrapper).not.toHaveClassName('fa-fw')
  })

  it('uses additional classes if set', () => {
    const wrapper = shallow(<Icon icon={'fa-user'} cssClasses={'some-class'} />)

    expect(wrapper).toHaveClassName('some-class')
  })

  it('calls onClick callback', () => {
    const handler = jest.fn(() => {})
    const wrapper = shallow(<Icon icon={'fa-user'} onClick={handler} />)

    wrapper.simulate('click')

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
