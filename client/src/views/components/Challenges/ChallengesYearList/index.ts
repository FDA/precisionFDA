import { connect } from 'react-redux'

import {
  fetchChallengesYearList,
} from '../../../../actions/challenges'
import {
  challengesYearListSelector,
  challengesYearListIsFetchingSelector,
} from '../../../../reducers/challenges/yearList/selectors'
import './style.sass'
import { YearList } from '../../List/YearList'


class ChallengesYearList extends YearList {
  static defaultProps = {
    elementName: 'challenges',
    years: [],
    isFetching: false,
    setYearHandler: () => {},
    fetchYearList: () => {},
  }
}

const mapStateToProps = (state: any) => ({
  years: challengesYearListSelector(state),
  isFetching: challengesYearListIsFetchingSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  fetchYearList: () => dispatch(fetchChallengesYearList()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChallengesYearList)
