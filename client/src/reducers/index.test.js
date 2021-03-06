import reducer from './index'


describe('reducer', () => {
  it('contains all required pieces of state', () => {
    const state = reducer({}, { type: undefined })

    expect(state.hasOwnProperty('context')).toBeTruthy()
    expect(state.hasOwnProperty('spaces')).toBeTruthy()
    expect(state.hasOwnProperty('home')).toBeTruthy()
  })
})
