import { connect } from 'react-redux'

import {
  fetchExpertsYearList,
} from '../../../../actions/experts'
import {
  expertsYearListSelector,
  expertsYearListIsFetchingSelector,
} from '../../../../reducers/experts/yearList/selectors'
import './style.sass'
import { YearList } from '../../List/YearList'


class ExpertsYearList extends YearList {
  static defaultProps = {
    elementName: 'experts',
    years: [],
    isFetching: false,
    setYearHandler: () => {},
    fetchYearList: () => {},
  }
}

const mapStateToProps = (state: any) => ({
  years: expertsYearListSelector(state),
  isFetching: expertsYearListIsFetchingSelector(state),
})

const mapDispatchToProps = (dispatch: any) => ({
  fetchYearList: () => dispatch(fetchExpertsYearList()),
})

export {
  ExpertsYearList
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpertsYearList)
