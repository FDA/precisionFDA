import React from 'react'
import { shallow } from 'enzyme'

import Button from './index'


describe('Button', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Button>Click me</Button>)

    expect(wrapper).toMatchSnapshot()
  })

  describe('when predefined size given', () => {
    it('has predefined size class', () => {
      const wrapper = shallow(<Button size="xs">Click me</Button>)

      expect(wrapper).toHaveClassName('btn-xs')
    })
  })

  describe('when non-predefined size given', () => {
    it('has no size class', () => {
      const wrapper = shallow(<Button size="some-size">Click me</Button>)

      expect(wrapper).not.toHaveClassName('btn-xs')
      expect(wrapper).not.toHaveClassName('btn-sm')
      expect(wrapper).not.toHaveClassName('btn-lg')
    })
  })

  describe('when predefined type given', () => {
    it('has predefined type class', () => {
      const wrapper = shallow(<Button type="info">Click me</Button>)

      expect(wrapper).toHaveClassName('btn-info')
    })
  })

  describe('when non-predefined type given', () => {
    it('doesn\'t default type class', () => {
      const wrapper = shallow(<Button type="some-type">Click me</Button>)

      expect(wrapper).toHaveClassName('btn-default')
    })
  })
})
