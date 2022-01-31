import * as S from './selectors'
import {expertsSelector} from "./selectors";


describe('selectors', () => {
  const state = {
    experts: {
      details: {
        askQuestionModal: {
          isOpen: false,
          isLoading: false,
        },
      },
    },
  }

  it('expertsSelector()', () => {
    expect(S.expertsSelector(state)).toEqual({
      details: {
        askQuestionModal: {
          isOpen: false,
          isLoading: false,
        },
      },
    },)
  })
})
