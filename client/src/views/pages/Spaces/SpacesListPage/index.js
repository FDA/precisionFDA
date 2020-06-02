import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import DefaultLayout from '../../../layouts/DefaultLayout'
import SpacesList from '../../../components/Spaces/SpacesList'
import SpacesListSwitcher from '../../../components/Spaces/SpacesListSwitcher'
import SpacesListSearch from '../../../components/Spaces/SpacesListSearch'
import Button from '../../../components/Button'
import { createSpaceLinkSelector } from '../../../../reducers/context/selectors'
import {
  resetSpacesListFilters,
  fetchSpaces,
  searchSpacesList,
} from '../../../../actions/spaces'
import './style.sass'


class SpacesListPage extends Component {
  constructor(props) {
    super(props)
    this.filterSpacesHandler = (searchString) => {
      const { filterSpaces, loadSpaces } = this.props
      filterSpaces(searchString)
      loadSpaces()
    }
  }

  componentDidMount() {
    const { loadSpaces, resetFilters } = this.props
    resetFilters()
    loadSpaces()
  }

  render() {
    const { createSpaceLink } = this.props

    return (
      <DefaultLayout>
        <div className="pfda-padded-20 spaces-page-layout">
          <div className="row">
            <div className="pull-left pfda-mr-r30">
              <SpacesListSwitcher />
            </div>
            <div className="pull-left">
              <SpacesListSearch filterSpacesHandler={this.filterSpacesHandler} />
            </div>
            <div className="pull-right">
              {createSpaceLink && (
                <Link to='/spaces/new'>
                  <Button type='primary' size='lg'>Create new space</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="pfda-padded-t40">
            <SpacesList />
          </div>
        </div>
      </DefaultLayout>
    )
  }
}

SpacesListPage.propTypes = {
  createSpaceLink: PropTypes.string,
  loadSpaces: PropTypes.func,
  resetFilters: PropTypes.func,
  filterSpaces: PropTypes.func,
}

SpacesListPage.defaultProps = {
  createSpaceLink: '',
  loadSpaces: () => {},
  resetFilters: () => {},
  filterSpaces: () => {},
}

const mapStateToProps = state => ({
  createSpaceLink: createSpaceLinkSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadSpaces: () => dispatch(fetchSpaces()),
  resetFilters: () => dispatch(resetSpacesListFilters()),
  filterSpaces: (searchString) => dispatch(searchSpacesList(searchString)),
})

export {
  SpacesListPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(SpacesListPage)
