import { shallow } from 'enzyme'
import { addDays, addHours } from 'date-fns'

import { ChallengesListItem } from '.'
import challenge from '../../../../reducers/challenges/challenge'


const getMockChallenge = () => {
  const startDate = new Date('2021-03-01Z20:21:00')
  const endDate = addHours(addDays(startDate, 7), 6)
  return {
    id: 1,
    name: 'Challenge '+1,
    description: 'This is challenge number '+1,
    startAt: startDate,
    endAt: endDate,
    cardImageUrl: 'https://images.newscientist.com/wp-content/uploads/2019/05/03155847/gettyimages-932737574-2.jpg',
  }
}

describe('ChallengesListItem test', () => {
  it('should render', () => {
    const mockChallenge = getMockChallenge()
    const wrapper = shallow(<ChallengesListItem challenge={mockChallenge} />)

    expect(wrapper).toMatchSnapshot()
  })
})
