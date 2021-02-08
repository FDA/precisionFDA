import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'

import * as C from '../../../../constants'
import SpaceListShape from '../../../shapes/SpaceListShape'
import PaginationShape from '../../../shapes/PaginationShape'
import Loader from '../../Loader'
import CardItem from './CardItem'
import SpacesTable from './SpacesTable'
import {
  fetchSpaces,
  sortSpacesList,
  fetchSpaceLockToggle,
  spacesSetPage,
} from '../../../../actions/spaces'
import {
  spacesListSelector,
  listViewTypeSelector,
  spacesListIsFetchingSelector,
  spacesListSortTypeSelector,
  spacesListSortDirectionSelector,
  spacesListPaginationSelector,
} from '../../../../reducers/spaces/list/selectors'
import './style.sass'
import Pagination from '../../TableComponents/Pagination'


const SpacesList = (props) => {
  const { spaces, viewType, pagintion, isFetching, sortType, sortDir } = props
  const { sortHandler, lockToggleHandler, setPageHandler } = props

  const isTableView = viewType === C.SPACE_TYPE_TABLE && spaces.length
  const isCardView = !isTableView && spaces.length

  const classes = classNames({
    'spaces-list': true,
    'spaces-list--card-view': isCardView,
    'spaces-list--table-view': isTableView,
  })

  if (isFetching) {
    return (
      <div className="text-center">
        <Loader />
      </div>
    )
  }

  if (isCardView) {
    return (
      <>
        <div className={classes}>
          {spaces.map((space) => <CardItem space={space} key={space.id} lockToggleHandler={lockToggleHandler} />)}
        </div>
        <Pagination data={pagintion} setPageHandler={setPageHandler} />
      </>
    )
  }

  if (isTableView) {
    return (
      <div className={classes}>
        <SpacesTable
          spaces={spaces}
          sortType={sortType}
          sortDir={sortDir}
          pagintion={pagintion}
          sortHandler={sortHandler}
          lockToggleHandler={lockToggleHandler}
          setPageHandler={setPageHandler}
        />
      </div>
    )
  }

  return <div className="text-center">No spaces found.</div>
}

SpacesList.propTypes = {
  spaces: PropTypes.arrayOf(PropTypes.exact(SpaceListShape)),
  viewType: PropTypes.oneOf(C.SPACE_VIEW_TYPES),
  isFetching: PropTypes.bool,
  sortType: PropTypes.string,
  sortDir: PropTypes.string,
  pagintion: PropTypes.exact(PaginationShape),
  sortHandler: PropTypes.func,
  lockToggleHandler: PropTypes.func,
  setPageHandler: PropTypes.func,
}

SpacesList.defaultProps = {
  spaces: [],
  sortHandler: () => { },
  lockToggleHandler: () => { },
  setPageHandler: () => { },
}

const mapStateToProps = state => ({
  spaces: spacesListSelector(state),
  viewType: listViewTypeSelector(state),
  isFetching: spacesListIsFetchingSelector(state),
  sortType: spacesListSortTypeSelector(state),
  sortDir: spacesListSortDirectionSelector(state),
  pagintion: spacesListPaginationSelector(state),
})

const mapDispatchToProps = dispatch => ({
  sortHandler: (type) => {
    dispatch(sortSpacesList(type))
    dispatch(fetchSpaces())
  },
  setPageHandler: (page) => {
    dispatch(spacesSetPage(page))
    dispatch(fetchSpaces())
  },
  lockToggleHandler: (spaceId, url) => dispatch(fetchSpaceLockToggle(spaceId, url)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpacesList)

export {
  SpacesList,
}
