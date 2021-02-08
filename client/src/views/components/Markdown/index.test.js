import React from 'react'
import { shallow } from 'enzyme'

import Markdown from './index'


describe('Markdown', () => {
  it('matches snapshot', () => {
    const data = '# h1 Heading'
    const component = shallow(<Markdown data={data} />)
    expect(component).toMatchSnapshot()
  })
})
