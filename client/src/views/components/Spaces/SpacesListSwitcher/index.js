import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import { SPACE_TYPE_TABLE, SPACE_TYPE_CARD, SPACE_VIEW_TYPES } from '../../../../constants'
import {
  switchListViewType,
  fetchSpaces,
  resetSpacesListFilters,
} from '../../../../actions/spaces'
import { listViewTypeSelector } from '../../../../reducers/spaces/list/selectors'
import Icon from '../../Icon'
import './style.sass'


const SpacesListSwitcher = ({ viewType, switchTypeHandler, loadSpaces, resetFilters }) => {
  const classTableView = classNames({
    'spaces-list-switcher__item--active': viewType === SPACE_TYPE_TABLE,
  }, 'spaces-list-switcher__item')
  const classCardView = classNames({
    'spaces-list-switcher__item--active': viewType === SPACE_TYPE_CARD,
  }, 'spaces-list-switcher__item')

  const switchViewType = (type) => {
    switchTypeHandler(type)
    resetFilters()
    loadSpaces()
  }

  const switchToTable = () => switchViewType(SPACE_TYPE_TABLE)
  const switchToCard = () => switchViewType(SPACE_TYPE_CARD)

  return (
    <div className="spaces-list-switcher">
      <div className="spaces-list-switcher__items">
        <div className={classCardView} onClick={switchToCard}>
          <Icon icon="fa-th-large" />
          Cards
        </div>
        <div className={classTableView} onClick={switchToTable} >
          <Icon icon="fa-th-list" />
          List
        </div>
      </div>
    </div>
  )
}

SpacesListSwitcher.propTypes = {
  viewType: PropTypes.oneOf(SPACE_VIEW_TYPES),
  switchTypeHandler: PropTypes.func,
  loadSpaces: PropTypes.func,
  resetFilters: PropTypes.func,
}

const mapStateToProps = state => ({
  viewType: listViewTypeSelector(state),
})

const mapDispatchToProps = dispatch => ({
  switchTypeHandler: (viewType) => dispatch(switchListViewType(viewType)),
  loadSpaces: () => dispatch(fetchSpaces()),
  resetFilters: () => dispatch(resetSpacesListFilters()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpacesListSwitcher)

export {
  SpacesListSwitcher,
}
