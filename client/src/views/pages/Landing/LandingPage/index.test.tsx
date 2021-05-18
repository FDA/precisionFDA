import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store'
import { mount, shallow } from 'enzyme'

import LandingPage from '.'
import ExpertsList from '../../../components/Experts/ExpertsList'
import ChallengesList from '../../../components/Challenges/ChallengesList'
import NewsList from '../../../components/News/NewsList'


const mockStore = configureStore([])

describe('LandingPage public test', () => {
  const getMockStore = () => {
    return mockStore({
      context: {
        user: {},
      },
      challenges: {
        list: {
        },
      },
      experts: {
        list: {
        },
      },
      news: {
        list: {
        },
      }
    })
  }

  it('should render', () => {
    const wrapper = shallow(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper).toMatchSnapshot()
  })

  // Skipping more involved mount tests below, because they're not flushed out yet
  it.skip('should contain expected components', () => {
    const wrapper = mount(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper.find(ChallengesList)).toHaveLength(1)
    expect(wrapper.find(ExpertsList)).toHaveLength(2)
    expect(wrapper.find(NewsList)).toHaveLength(1)
  })
})


describe('LandingPage guest user test', () => {
  const mockGuestUser = { is_guest: true }

  const getMockStore = () => {
    return mockStore({
      context: {
        user: mockGuestUser,
      },
    })
  }

  it('should render', () => {
    const wrapper = shallow(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper).toMatchSnapshot()
  })

  it.skip('should contain expected components', () => {
    const wrapper = mount(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper.find(ChallengesList)).toHaveLength(1)
    expect(wrapper.find(ExpertsList)).toHaveLength(2)
    expect(wrapper.find(NewsList)).toHaveLength(1)
  })
})


describe('LandingPage logged in user test', () => {
  const mockUser = {
    id: 123,
    dxuser: 'dx123',
    first_name: 'User 123',
    last_name: 'LastName',
    full_name: 'User 123 LastName',
    email: 'dx123@dnanexus.com',
    admin: false,
    is_guest: false,
    gravatar_url: 'gravatar_url_123',
  }
  
  const getMockStore = () => {
    return mockStore({
      context: {
        user: mockUser,
      },
    })
  }

  it('should render', () => {
    const wrapper = shallow(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper).toMatchSnapshot()
  })

  it.skip('should contain expected components', () => {
    const wrapper = mount(<Provider store={getMockStore()}><BrowserRouter><LandingPage /></BrowserRouter></Provider>)
    expect(wrapper.find(ChallengesList)).toHaveLength(1)
    expect(wrapper.find(ExpertsList)).toHaveLength(2)
    expect(wrapper.find(NewsList)).toHaveLength(1)
  })
})
