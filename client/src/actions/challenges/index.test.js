import {
  challengesSetPage,
  challengesSetYear,
  challengesSetTimeStatus,
} from '.'
import {
  CHALLENGES_SET_PAGE,
  CHALLENGES_SET_TIME_STATUS,
  CHALLENGES_SET_YEAR,
} from './types'


describe('challengesSetPage()', () => {
  it('creates correct action', () => {
    const page = 123
    expect(challengesSetPage(page)).toEqual({
      type: CHALLENGES_SET_PAGE,
      payload: 123,
    })
  })
})

describe('challengesSetYear()', () => {
  it('creates correct action', () => {
    const year = 2020
    expect(challengesSetYear(year)).toEqual({
      type: CHALLENGES_SET_YEAR,
      payload: year,
    })
  })
})

describe('challengesSetTimeStatus()', () => {
  it('creates correct action', () => {
    const timeStatus = 'upcoming'
    expect(challengesSetTimeStatus(timeStatus)).toEqual({
      type: CHALLENGES_SET_TIME_STATUS,
      payload: timeStatus,
    })
  })
})
