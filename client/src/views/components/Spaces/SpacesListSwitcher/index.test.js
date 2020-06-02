import React from 'react'
import { shallow } from 'enzyme'

import { SPACE_TYPE_TABLE, SPACE_TYPE_CARD } from '../../../../constants'
import { SpacesListSwitcher } from './'


describe('<SpacesListSwitcher />', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<SpacesListSwitcher />)
    expect(wrapper).toMatchSnapshot()
  })

  describe('when space is vertical', () => {
    it('renders active class for card if view type is card', () => {
      const wrapper = shallow(<SpacesListSwitcher viewType={SPACE_TYPE_CARD} />)
      const itemDiv = wrapper.find('.spaces-list-switcher__item').at(0)

      expect(itemDiv.hasClass('spaces-list-switcher__item--active')).toEqual(true)
    })

    it('renders active class for table if view type is table', () => {
      const wrapper = shallow(<SpacesListSwitcher viewType={SPACE_TYPE_TABLE} />)
      const itemDiv = wrapper.find('.spaces-list-switcher__item').at(1)

      expect(itemDiv.hasClass('spaces-list-switcher__item--active')).toEqual(true)
    })
  })
})
