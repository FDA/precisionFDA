import { createBrowserHistory } from 'history'

import store from '../store'
import { clearErrorPage } from '../views/components/ErrorWrapper/actions'
import { errorPageSelector } from '../views/components/ErrorWrapper/selectors'


const history = createBrowserHistory()

history.listen(() => {
  const { dispatch, getState } = store

  if (errorPageSelector(getState())) {
    dispatch(clearErrorPage())
  }
})

export default history
