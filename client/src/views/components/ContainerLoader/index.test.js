import React from 'react'
import { shallow } from 'enzyme'

import ContainerLoader from '.'


describe('ContainerLoader', () => {
  it('matches snapshot', () => {
    const component = shallow(<ContainerLoader />)
    expect(component).toMatchSnapshot()
  })
})

describe('ContainerLoader has text', () => {
  it('renders loader without text', () => {
    const wrapper = shallow(<ContainerLoader />)
    expect(wrapper.exists('.pfda-container-loader__text')).toEqual(false)
  })

  it('renders loader with text', () => {
    const wrapper = shallow(<ContainerLoader text="Some Text" />)
    expect(wrapper.exists('.pfda-container-loader__text')).toEqual(true)
    expect(wrapper.find('.pfda-container-loader__text').at(0).text()).toEqual('Some Text')
  })
})
