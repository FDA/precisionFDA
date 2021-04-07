import React from 'react'
import { shallow } from 'enzyme'
import { QueryClient, QueryClientProvider } from 'react-query'

import { ParticipantPersonsList } from '.'


describe('ParticipantPersonsList', () => {
    it('matches snapshot', () => {
      const queryClient = new QueryClient();
      const wrapper = shallow(<QueryClientProvider client={queryClient}><ParticipantPersonsList /></QueryClientProvider>)
  
      expect(wrapper).toMatchSnapshot()
    })
})