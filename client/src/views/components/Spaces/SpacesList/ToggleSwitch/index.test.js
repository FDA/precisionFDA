import React from 'react'
import { shallow } from 'enzyme'

import ToggleSwitch from './'


describe('<ToggleSwitch />', () => {
  let space = null

  beforeEach(() => {
    space = {
      id: 1,
      isLocked: true,
      hasLockLink: true,
      links: {
        lock: 'some lock link',
        unlock: 'some unlock link',
      },
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallow(<ToggleSwitch space={space} vertical />)

    expect(wrapper).toMatchSnapshot()
  })

  describe('when space is locked', () => {
    it('renders locked class if space is locked', () => {
      space.isLocked = true

      const wrapper = shallow(<ToggleSwitch space={space} />)
      const sliderDiv = wrapper.find('.toggle-switch__slider').at(0)

      expect(sliderDiv.hasClass('toggle-switch__slider--locked')).toEqual(true)
    })
  })

  describe('when space is active', () => {
    it('not renders locked class if space is not locked', () => {
      space.isLocked = false

      const wrapper = shallow(<ToggleSwitch space={space} />)
      const sliderDiv = wrapper.find('.toggle-switch__slider').at(0)

      expect(sliderDiv.hasClass('toggle-switch__slider--locked')).toEqual(false)
    })
  })

  describe('when space is vertical', () => {
    it('renders vertical class if space is vertical', () => {
      const wrapper = shallow(<ToggleSwitch space={space} vertical />)
      const toggleDiv = wrapper.find('.toggle-switch').at(0)

      expect(toggleDiv.hasClass('toggle-switch--vertical')).toEqual(true)
    })
  })

  describe('when space is not vertical', () => {
    it('not renders vertical class if space is not vertical', () => {
      const wrapper = shallow(<ToggleSwitch space={space} />)
      const toggleDiv = wrapper.find('.toggle-switch').at(0)

      expect(toggleDiv.hasClass('toggle-switch--vertical')).toEqual(false)
    })
  })

  describe('when space is not disabled', () => {
    it('render disable modificators', () => {
      space.isLocked = true

      const wrapper = shallow(<ToggleSwitch space={space} />)
      const toggleDiv = wrapper.find('.toggle-switch').at(0)
      const sliderDiv = wrapper.find('.toggle-switch__slider').at(0)

      expect(toggleDiv.hasClass('toggle-switch--disabled')).toEqual(false)
      expect(sliderDiv.hasClass('toggle-switch__slider--disabled')).toEqual(false)
      expect(toggleDiv.prop('title')).toEqual('Unlock space')
    })
  })

  describe('when space is disabled', () => {
    it('render disable modificators', () => {
      space.links = {}
      space.hasLockLink = false

      const wrapper = shallow(<ToggleSwitch space={space} />)
      const toggleDiv = wrapper.find('.toggle-switch').at(0)
      const sliderDiv = wrapper.find('.toggle-switch__slider').at(0)

      expect(toggleDiv.hasClass('toggle-switch--disabled')).toBe(true)
      expect(sliderDiv.hasClass('toggle-switch__slider--disabled')).toBe(true)
      expect(toggleDiv.prop('title')).toEqual('You have no access for this action')
    })
  })
})
