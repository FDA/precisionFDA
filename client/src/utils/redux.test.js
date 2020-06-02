import { createReducer, createAction } from './redux'


describe('createReducer()', () => {
  test('it returns reducer function', () => {
    const reducer = createReducer({})

    expect(typeof reducer).toEqual('function')
  })

  test('reducer correctly calls handler function when handler given', () => {
    const initialState = { a: 'b' }
    const type = 'SOME_TYPE'
    const payload = 'some payload'
    const action = { type, payload }

    const handler = jest.fn((state, payload) => ({
      ...state,
      a: payload,
    }))

    const reducer = createReducer(initialState, {
      [type]: handler,
    })

    const state = reducer(initialState, action)

    expect(handler).toBeCalledWith(initialState, payload)
    expect(state).toEqual({ a: payload })

    handler.mockClear()

    reducer(initialState, { type: 'SOME_ANOTHER_TYPE' })

    expect(handler).not.toBeCalled()
    expect(state).toEqual({ a: payload })
  })

  test("reducer doesn't call handler function when no handler given", () => {
    const initialState = { a: 'b' }
    const type = 'SOME_TYPE'
    const payload = 'some payload'
    const action = { type, payload }
    const handler = jest.fn(() => {})
    const reducer = createReducer(initialState)

    reducer(initialState, action)
    expect(handler).not.toBeCalled()
  })

  test('reducer is called with initialState when no state given', () => {
    const action = { type: 'some type', payload: 'some payload' }
    const initialState = 'some state'
    const reducer = createReducer(initialState)

    const state = reducer(undefined, action)

    expect(state).toEqual(initialState)
  })
})

describe('createAction()', () => {
  test('it returns correct action with payload', () => {
    const type = 'SOME_TYPE'
    const payload = 'SOME_PAYLOAD'
    const action = createAction(type, payload)

    expect(action).toEqual({ type, payload })
  })

  test('it returns correct action without payload', () => {
    const type = 'SOME_TYPE'
    const action = createAction(type)

    expect(action).toEqual({ type, payload: {}})
  })
})
