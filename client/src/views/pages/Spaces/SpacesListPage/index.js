import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import DefaultLayout from '../../../layouts/DefaultLayout'
import SpacesList from '../../../components/Spaces/SpacesList'
import SpacesListSwitcher from '../../../components/Spaces/SpacesListSwitcher'
import SpacesListSearch from '../../../components/Spaces/SpacesListSearch'
import {
  contextUserSelector,
  createSpaceLinkSelector,
} from '../../../../reducers/context/selectors'
import {
  fetchSpaces,
  resetSpacesListFilters,
  searchSpacesList,
  showLayoutCreateSpaceModal,
} from '../../../../actions/spaces'
import './style.sass'
import { GuestNotAllowed } from '../../../../components/GuestNotAllowed'
import Button from '../../../components/Button'
import { NEW_SPACE_PAGE_ACTIONS } from '../../../../constants'
// eslint-disable-next-line
import { CreateSpaceModal } from '../../../components/Space/LayoutModals/CreateSpaceModal'

class SpacesListPage extends Component {
  constructor(props) {
    super(props)
    const { filterSpaces, loadSpaces, showCreateSpaceModal } = this.props

    this.filterSpacesHandler = searchString => {
      filterSpaces(searchString)
      loadSpaces()
    }
    this.createSpaceModal = action => showCreateSpaceModal(action)
  }

  componentDidMount() {
    const { loadSpaces, resetFilters } = this.props
    resetFilters()
    loadSpaces()
  }

  render() {
    const { createSpaceLink, user } = this.props

    if (user?.is_guest) {
      return (
        <DefaultLayout>
          <GuestNotAllowed />
        </DefaultLayout>
      )
    }

    return (
      <DefaultLayout>
        <div className="pfda-padded-20 spaces-page-layout">
          <div className="row">
            <div className="pull-left pfda-mr-r30">
              <SpacesListSwitcher />
            </div>
            <div className="pull-left">
              <SpacesListSearch
                filterSpacesHandler={this.filterSpacesHandler}
              />
            </div>
            <div className="pull-right">
              {createSpaceLink && (
                <Button
                  type="primary"
                  size="lg"
                  onClick={() =>
                    this.createSpaceModal(NEW_SPACE_PAGE_ACTIONS.CREATE)
                  }
                >
                  Create new space
                </Button>
              )}
            </div>
          </div>
          <div className="pfda-padded-t40">
            <SpacesList />
          </div>
        </div>
        {createSpaceLink && (
          <CreateSpaceModal action={NEW_SPACE_PAGE_ACTIONS.CREATE} />
        )}
      </DefaultLayout>
    )
  }
}

SpacesListPage.propTypes = {
  createSpaceLink: PropTypes.string,
  loadSpaces: PropTypes.func,
  resetFilters: PropTypes.func,
  filterSpaces: PropTypes.func,
  showCreateSpaceModal: PropTypes.func,
  user: PropTypes.any,
}

SpacesListPage.defaultProps = {
  createSpaceLink: '',
  loadSpaces: () => {},
  resetFilters: () => {},
  filterSpaces: () => {},
  showCreateSpaceModal: () => {},
}

const mapStateToProps = state => ({
  createSpaceLink: createSpaceLinkSelector(state),
  user: contextUserSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadSpaces: () => dispatch(fetchSpaces()),
  resetFilters: () => dispatch(resetSpacesListFilters()),
  filterSpaces: searchString => dispatch(searchSpacesList(searchString)),
  showCreateSpaceModal: () => dispatch(showLayoutCreateSpaceModal()),
})

export { SpacesListPage }

export default connect(mapStateToProps, mapDispatchToProps)(SpacesListPage)
