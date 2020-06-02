import React from 'react'
import { shallow } from 'enzyme'

import Container from '.'


describe('Container', () => {
  it('matches snapshot', () => {
    const component = shallow(<Container><div>Div</div></Container>)
    expect(component).toMatchSnapshot()
  })
})
