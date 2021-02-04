import React from 'react'
import { shallow } from 'enzyme'

import { HomeEditTagsModal } from '.'


describe('HomeEditTagsModal test', () => {
  it('should render', () => {
    const component = shallow(<HomeEditTagsModal />)

    expect(component).toMatchSnapshot()
  })
})
