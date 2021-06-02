import React from 'react'
import { shallow } from 'enzyme'
import { QueryClient, QueryClientProvider } from 'react-query'

import { ParticipantOrgsList } from '.'


describe('ParticipantOrgsList', () => {
  it('matches snapshot', () => {
    const queryClient = new QueryClient();
    const wrapper = shallow(<QueryClientProvider client={queryClient}><ParticipantOrgsList /></QueryClientProvider>)

    expect(wrapper).toMatchSnapshot()
  })
})
