import React from 'react'
import { shallow } from 'enzyme'

import Alert from './Alert'
import { ALERT_ABOVE_ALL } from '../../../constants'


describe('<Alert />', () => {
  let alert = null

  beforeEach(() => {
    alert = {
      id: '1',
      type: ALERT_ABOVE_ALL,
      style: 'info',
      message: 'some text',
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallow(<Alert alert={alert} />)

    expect(wrapper).toMatchSnapshot()
  })

  describe('alert types', () => {
    it('renders above all class', () => {
      const wrapper = shallow(<Alert alert={alert} />)
      expect(wrapper.hasClass('alert-notifications__message--above-all')).toBe(true)
    })
  })

  describe('alert styles', () => {
    it('renders alert-info class if style is info', () => {
      const wrapper = shallow(<Alert alert={alert} />)
      expect(wrapper.hasClass('alert-info')).toBe(true)
    })
    it('renders alert-success class if style is success', () => {
      alert.style = 'success'
      const wrapper = shallow(<Alert alert={alert} />)
      expect(wrapper.hasClass('alert-success')).toBe(true)
    })
  })
})
