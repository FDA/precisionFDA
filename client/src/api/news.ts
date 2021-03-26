import { backendCall } from '../utils/api'
// Maybe not so good to import from views … consider pushing up IPagination to a lower level
import { IPagination } from '../views/shapes/IPagination'


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
