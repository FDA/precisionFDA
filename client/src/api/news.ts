import { backendCall } from '../utils/api'
import { IPagination } from '../types/pagination'


interface IGetNewsParams {
  pagination?: IPagination,
  year?: number,
}

const getNews = (data: IGetNewsParams) => backendCall('/api/news', 'GET', data)
const getNewsYearList = () => backendCall('/api/news/years', 'GET')

export {
  getNews,
  getNewsYearList
}
