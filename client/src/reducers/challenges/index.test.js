import reducer from './index'


describe('reducer', () => {
  it('contains all required pieces of state', () => {
    const state = reducer({}, { type: undefined })

    expect(state.hasOwnProperty('list')).toBeTruthy()
  })
})
