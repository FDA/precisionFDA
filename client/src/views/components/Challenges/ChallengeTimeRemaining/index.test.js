import React from 'react'
import { shallow } from 'enzyme'
import { addHours, subHours, addDays, subDays } from 'date-fns'

import { ChallengeTimeRemaining } from '.'
import { CHALLENGE_TIME_STATUS } from '../../../../constants'


describe('ChallengeTimeRemaining', () => {
  it('matches snapshot', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.CURRENT,
      startAt: subHours(dateNow, 6),
      endAt: addHours(dateNow, 6),
    }
    const wrapper = shallow(<ChallengeTimeRemaining challenge={challenge} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('works with current challenges', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.CURRENT,
      startAt: subHours(dateNow, 6),
      endAt: addHours(dateNow, 6),
    }
    const wrapper = shallow(<ChallengeTimeRemaining challenge={challenge} />)
    expect(wrapper.html()).toEqual('<span>About 6 hours remaining</span>')
  })

  it('works with upcoming challenges', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.UPCOMING,
      startAt: addDays(dateNow, 6),
      endAt: addDays(dateNow, 12),
    }
    const wrapper = shallow(<ChallengeTimeRemaining challenge={challenge} />)
    expect(wrapper.html()).toEqual('<span>Starting in about 6 days</span>')
  })

  it('works with ended challenges', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.ENDED,
      startAt: subDays(dateNow, 12),
      endAt: subDays(dateNow, 6),
    }
    const wrapper = shallow(<ChallengeTimeRemaining challenge={challenge} />)
    expect(wrapper.html()).toEqual('<span>Ended</span>')
  })
})
