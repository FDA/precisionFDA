import React from 'react'
import { shallow } from 'enzyme'

import { LoaderWrapper } from './index'


describe('LoaderWrapper', () => {
  it('matches snapshot', () => {
    const component = shallow(<LoaderWrapper><div>Div</div></LoaderWrapper>)
    expect(component).toMatchSnapshot()
  })
})
