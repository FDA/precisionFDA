import { YearList } from '../../List/YearList'
import { queryNewsYearList } from '../../../../api/news'


class NewsYearList extends YearList {
  static defaultProps = {
    elementName: 'news',
    query: queryNewsYearList,
    setYearHandler: () => {},
  }
}

export {
  NewsYearList,
}
export default NewsYearList
