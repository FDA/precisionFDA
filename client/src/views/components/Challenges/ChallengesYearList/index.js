import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import Loader from '../../Loader'
import {
  fetchChallengesYearList,
} from '../../../../actions/challenges'
import {
  challengesYearListSelector,
  challengesYearListIsFetchingSelector,
} from '../../../../reducers/challenges/yearList/selectors'
import './style.sass'


class ChallengesYearList extends React.Component {

  componentDidMount() {
    const { fetchYearList } = this.props
    fetchYearList()
  }

  render() {
    const { years, isFetching, setYearHandler } = this.props
    const classes = classNames(['challenges-year-list'])
  
    if (isFetching) {
      return (
        <div>
          <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
          <div className='text-center'>
            <Loader />
          </div>
        </div>
      )
    }

    if (!years) {
      return (
        <div>
          <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
          <div className='text-center'>
            No previous challenges
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className="pfda-subsection-heading">PREVIOUS CHALLENGES</div>
        <ul className={classes}>
          {years.map((year) => (
            <li key={year}>
              <a onClick={() => setYearHandler(year)}>{year}</a>
            </li>
          ), this)}
        </ul>
      </div>
    )
  }
}


ChallengesYearList.propTypes = {
  years: PropTypes.array,
  isFetching: PropTypes.bool,
  setYearHandler: PropTypes.func,
  fetchYearList: PropTypes.func,
}

ChallengesYearList.defaultProps = {
  years: [],
  isFetching: false,
  setYearHandler: () => {},
  fetchYearList: () => {},
}

const mapStateToProps = state => ({
  years: challengesYearListSelector(state),
  isFetching: challengesYearListIsFetchingSelector(state),
})

const mapDispatchToProps = dispatch => ({
  fetchYearList: () => dispatch(fetchChallengesYearList()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChallengesYearList)
