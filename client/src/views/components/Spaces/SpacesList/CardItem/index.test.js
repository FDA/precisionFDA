import React from 'react'
import { shallow } from 'enzyme'

import CardItem from './'


describe('<CardItem />', () => {
  let space = null

  beforeEach(() => {
    space = {
      id: 100,
      hasPrivate: false,
      shared: {
        name: 'some name',
        isLocked: true,
        links: {
          show: 'some link',
          unlock: 'some link',
        },
      },
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallow(<CardItem space={space} />)
    expect(wrapper).toMatchSnapshot()
  })
})
