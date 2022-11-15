import React from 'react'
import { render, screen } from '@testing-library/react'
import { addHours, subHours, addDays, subDays } from 'date-fns'

import { ChallengeTimeRemaining } from '.'
import { CHALLENGE_TIME_STATUS } from '../../../../constants'


describe('ChallengeTimeRemaining', () => {
  test.skip('works with current challenges', async () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.CURRENT,
      startAt: subHours(dateNow, 6),
      endAt: addHours(dateNow, 6),
    }

    render(<ChallengeTimeRemaining challenge={challenge} />)
  
    expect(screen.getByRole()).toHaveTextContent('About 6 hours remaining')
  })

  test.skip('works with upcoming challenges', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.UPCOMING,
      startAt: addDays(dateNow, 6),
      endAt: addDays(dateNow, 12),
    }
    render(<ChallengeTimeRemaining challenge={challenge} />)
    expect(screen.getByRole()).toHaveTextContent('Starting in about 6 days')
  })

  test.skip('works with ended challenges', () => {
    const dateNow = new Date()
    const challenge = {
      timeStatus: CHALLENGE_TIME_STATUS.ENDED,
      startAt: subDays(dateNow, 12),
      endAt: subDays(dateNow, 6),
    }
    render(<ChallengeTimeRemaining challenge={challenge} />)
    expect(screen.getByRole()).toHaveTextContent('Ended')
  })
})
