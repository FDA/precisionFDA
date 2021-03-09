import React from 'react'
import { shallow } from 'enzyme'

import HomeExecutionInputsOutputs from '.'


describe('HomeExecutionInputsOutputs test', () => {
  it('should render', () => {
    const component = shallow(<HomeExecutionInputsOutputs />)

    expect(component).toMatchSnapshot()
  })
})
