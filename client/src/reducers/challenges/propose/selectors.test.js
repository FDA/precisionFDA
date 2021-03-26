import * as S from './selectors'
import reducer from '../../index'


describe('selectors', () => {
  const isSubmitting = true
  const state = reducer({
    challenges: {
      propose: {
        isSubmitting,
      },
    },
  }, { type: undefined })


  it('challengeProposeIsSubmittingSelector()', () => {
    expect(S.challengeProposeIsSubmittingSelector(state)).toEqual(isSubmitting)
  })
})
