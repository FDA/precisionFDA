import reducer from './index'


describe('reducer', () => {
  it('contains all required pieces of state', () => {
    const state = reducer({ list: undefined, yearList: undefined}, { type: undefined })

    expect(state.hasOwnProperty('list')).toBeTruthy()
    expect(state.hasOwnProperty('yearList')).toBeTruthy()
  })
})
