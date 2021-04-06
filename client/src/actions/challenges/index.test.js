import {
  challengesSetPage,
} from '.'
import {
  CHALLENGES_SET_PAGE,
} from './types'


describe('fetchChallengesStart()', () => {
  it('creates correct action', () => {
    const page = 123
    expect(challengesSetPage(page)).toEqual({
      type: CHALLENGES_SET_PAGE,
      payload: 123,
    })
  })
})
