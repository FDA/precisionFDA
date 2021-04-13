import { YearList } from '../../List/YearList'
import { queryChallengesYearList } from '../../../../api/challenges'


class ChallengesYearList extends YearList {
  static defaultProps = {
    elementName: 'challenges',
    query: queryChallengesYearList,
    setYearHandler: () => {},
  }
}

export {
  ChallengesYearList,
}
export default ChallengesYearList
