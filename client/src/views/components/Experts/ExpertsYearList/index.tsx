import { YearList } from '../../List/YearList'
import { queryExpertsYearList } from '../../../../api/experts'


class ExpertsYearList extends YearList {
  static defaultProps = {
    elementName: 'experts',
    query: queryExpertsYearList,
    setYearHandler: () => {},
  }
}

export {
  ExpertsYearList,
}
export default ExpertsYearList
