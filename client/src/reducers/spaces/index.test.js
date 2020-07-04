import reducer from './index'


describe('reducer', () => {
  it('contains all required pieces of state', () => {
    const state = reducer({}, { type: undefined })

    expect(state.hasOwnProperty('list')).toBeTruthy()
    expect(state.hasOwnProperty('space')).toBeTruthy()
    expect(state.hasOwnProperty('files')).toBeTruthy()
    expect(state.hasOwnProperty('jobs')).toBeTruthy()
    expect(state.hasOwnProperty('apps')).toBeTruthy()
    expect(state.hasOwnProperty('workflows')).toBeTruthy()
  })
})
