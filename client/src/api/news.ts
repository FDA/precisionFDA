import { backendCall } from '../utils/api'
import { IPagination } from '../types/pagination'
import { queryYearList } from './yearList'


interface IGetNewsParams {
  pagination?: IPagination,
  year?: number,
}

const getNews = (data: IGetNewsParams) => backendCall('/api/news', 'GET', data)

const queryNewsYearList = () => {
  return queryYearList('/api/news/years/')
}


export {
  getNews,
  queryNewsYearList,
}
