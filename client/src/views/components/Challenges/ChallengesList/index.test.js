import React from 'react'
import { Router, Route } from 'react-router-dom'
import { mount } from 'enzyme'
import { createMemoryHistory } from 'history'
import { addDays, subDays, addHours } from 'date-fns'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import Loader from '../../Loader'
import { ChallengesList } from '.'
import { ChallengesListItem } from '../ChallengesListItem'
import { ChallengesListPage } from '../../../pages/Challenges/ChallengesListPage'
import { ChallengeDetailsPage } from '../../../pages/Challenges/ChallengeDetailsPage'


const mockStore = configureStore([])

const getMockChallenges = () => {
  let mockChallenges = []
  const dateNow = new Date()

  const firstStartDate = addDays(addHours(dateNow, 6), 5)
  const firstEndDate = addDays(firstStartDate, 7)
  for (let i=0; i<10; i++) {
    const startDate = subDays(firstStartDate, i*2)
    const endDate = subDays(firstEndDate, i*2)

    mockChallenges.push({
      id: i,
      name: 'Challenge '+i,
      description: 'This is challenge number '+i,
      startAt: startDate,
      endAt: endDate,
      cardImageUrl: 'https://images.newscientist.com/wp-content/uploads/2019/05/03155847/gettyimages-932737574-2.jpg',
    })
  }
  return mockChallenges
}


describe('ChallengesList test', () => {
  it('should render', () => {
    const store = mockStore({
      challenges: {
        list: {
          isFetching: false,
        },
      },
    })
    const wrapper = mount(<Provider store={store}><ChallengesList /></Provider>)
    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching', () => {
    const store = mockStore({
      challenges: {
        list: {
          isFetching: true,
        },
      },
    })

    const wrapper = mount(<Provider store={store}><ChallengesList /></Provider>)
    wrapper.update()

    // console.log(wrapper.debug())
    expect(wrapper.find(Loader)).toHaveLength(1)
    expect(wrapper.find(ChallengesListItem)).toHaveLength(0)
  })

  it('should not show loader when not fetching and show ChallengesList with no rows', () => {
    const store = mockStore({
      challenges: {
        list: {
          isFetching: false,
          items: [],
        },
      },
    })

    const wrapper = mount(<Provider store={store}><ChallengesList /></Provider>)
    // console.log(wrapper.debug())

    expect(wrapper.find(Loader)).toHaveLength(0)
    expect(wrapper.find('div.text-center').text()).toEqual('No challenges found.')
    expect(wrapper.find({ text: 'No challenges found.' })).toHaveLength(0)
    expect(wrapper.find('ul')).toHaveLength(0)
    expect(wrapper.find('li')).toHaveLength(0)
  })

  it('should render 10 rows', () => {
    const mockChallenges = getMockChallenges()
    const mockPagination = {
      currentPage: 1,
      totalPages: 2,
      nextPage: 2,
      prevPage: null,
      totalCount: 20,
    }
    const store = mockStore({
      challenges: {
        list: {
          isFetching: false,
          items: mockChallenges,
          pagination: mockPagination,
        },
      },
    })

    const wrapper = mount(<Provider store={store}><ChallengesList /></Provider>)
    // console.log(wrapper.debug())

    // Test items
    expect(wrapper.find('ul')).toHaveLength(1)

    // Test item props
    const items = wrapper.find(ChallengesListItem)
    expect(items).toHaveLength(10)
    expect(items.at(0)).toHaveProp('challenge')
    // console.log(items.at(0).props())
    expect(items.at(9).props().challenge.id).toEqual(9)
    expect(items.at(8).props().challenge.name).toEqual('Challenge 8')
    expect(items.at(7).props().challenge.description).toEqual('This is challenge number 7')
  })

  it.skip('should load details page when button is clicked', () => {
    const mockChallenges = getMockChallenges()
    const history = createMemoryHistory('/challenges')
    const wrapper = mount(<Router history={history}>
        <Route path='/challenges'>
          <ChallengesListPage challenges={mockChallenges} />
        </Route>
        <Route path='/challenges/:challengeId'>
          <ChallengeDetailsPage />
        </Route>
      </Router>)
    
    // Test click
    wrapper.find(ChallengesListItem).at(0).simulate('click')
    expect(wrapper.find(ChallengeDetailsPage)).toHaveLength(1)
  })

})
