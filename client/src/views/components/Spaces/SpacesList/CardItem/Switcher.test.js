import React from 'react'
import { shallow } from 'enzyme'

import Switcher from './Switcher'


describe('<Switcher />', () => {
  let space = null

  beforeEach(() => {
    space = {
      name: 'some name',
      isLocked: true,
      hasLockLink: true,
      links: {
        show: 'some link',
        unlock: 'some link',
      },
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallow(<Switcher space={space} />)

    expect(wrapper).toMatchSnapshot()
  })

  describe('when space is locked', () => {
    it('renders locked class if space is locked', () => {
      space.isLocked = true

      const wrapper = shallow(<Switcher space={space} />)
      expect(wrapper.hasClass('spaces-list-card-switcher--locked')).toBe(true)
    })
  })

  describe('when space is active', () => {
    it('not renders locked class if space is not locked', () => {
      space.isLocked = false

      const wrapper = shallow(<Switcher space={space} />)
      expect(wrapper.hasClass('spaces-list-card-switcher--locked')).toBe(false)
    })
  })
})
