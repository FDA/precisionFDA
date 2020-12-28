import React from 'react'
import { Provider } from 'react-redux'
import { shallow } from 'enzyme'

import { mockStore } from '../../../../../test/helper'
import reducer from '../../../../reducers'
import ChallengesYearList from './index'


describe('ChallengesYearList', () => {
    it('matches snapshot', () => {
      const store = mockStore(reducer({}, { type: undefined }))
      const wrapper = shallow(<Provider store={store}><ChallengesYearList /></Provider>)
  
      expect(wrapper).toMatchSnapshot()
    })
})