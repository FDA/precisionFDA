import { createSpaceLinkSelector, isInitializedSelector, contextLinksSelector } from './selectors'
import reducer from '../index'


describe('createSpaceLinkSelector()', () => {
  it('returns correct piece of state', () => {
    const state = reducer({
      context: {
        links: {
          space_create: 'some link',
        },
      },
    }, { type: undefined })

    expect(createSpaceLinkSelector(state)).toEqual('some link')
  })
})

describe('isInitializedSelector()', () => {
  it('returns correct piece of state', () => {
    const state = reducer({
      context: { isInitialized: true },
    }, { type: undefined })

    expect(isInitializedSelector(state)).toBe(true)
  })
})

describe('contextLinksSelector()', () => {
  it('returns correct piece of state', () => {
    const state = reducer({
      context: { links: {}},
    }, { type: undefined })

    expect(contextLinksSelector(state)).toEqual({})
  })
})
