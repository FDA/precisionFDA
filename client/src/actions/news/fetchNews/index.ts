import httpStatusCodes from 'http-status-codes'

import { createAction } from '../../../utils/redux'
import * as API from '../../../api/news'
import {
  NEWS_LIST_FETCH_START,
  NEWS_LIST_FETCH_SUCCESS,
  NEWS_LIST_FETCH_FAILURE,
} from '../types'
import * as C from '../../../constants'
import { mapToNewsItem } from '../../../types/newsItem'
import { mapToPagination } from '../../../views/shapes/PaginationShape'
import {
  newsListPaginationSelector,
  newsListYearSelector,
} from '../../../reducers/news/list/selectors'
import { showAlertAboveAll } from '../../alertNotifications'
import { INewsListActionPayload } from '../../../reducers/news/list'


const fetchNewsStart = () => createAction(NEWS_LIST_FETCH_START)

const fetchNewsSuccess = (actionPayload: INewsListActionPayload) => createAction(NEWS_LIST_FETCH_SUCCESS, actionPayload)

const fetchNewsFailure = () => createAction(NEWS_LIST_FETCH_FAILURE)

const fetchNews = () => (
  (dispatch: any, getState: any) => {
    const state = getState()
    const pagination = newsListPaginationSelector(state)
    let params = {}

    const year = newsListYearSelector(state)
    if (year) {
      params = { ...params, year: year }
    }

    if (pagination && pagination.currentPage > 1) {
      params = { ...params, page: pagination.currentPage }
    }

    dispatch(fetchNewsStart())

    return API.getNews(params)
      .then(response => {
        if (response.status === httpStatusCodes.OK) {
          const actionPayload: INewsListActionPayload = {
            items: response.payload.news_items.map(mapToNewsItem),
            pagination: mapToPagination(response.payload.meta),
          }
          dispatch(fetchNewsSuccess(actionPayload))
        } else {
          dispatch(fetchNewsFailure())
          dispatch(showAlertAboveAll({ message: 'Something went wrong loading News!' }))
        }
      })
      .catch(e => {
        console.error(e)
        dispatch(showAlertAboveAll({ message: 'Something went wrong loading News!' }))
      })
  }
)

export {
  fetchNews
}
