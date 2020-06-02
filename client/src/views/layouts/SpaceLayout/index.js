import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import DefaultLayout from '../DefaultLayout'
import SpaceShape from '../../shapes/SpaceShape'
import ContainerLoader from '../../components/ContainerLoader'
import TagsList from '../../components/TagsList'
import { spaceIsFetchingSelector } from '../../../reducers/spaces/space/selectors'
import Activation from '../../components/Space/Activation'
import { isInitializedSelector } from '../../../reducers/context/selectors'
import { fetchSpace } from '../../../actions/spaces'
import Tabs from './Tabs'
import Menu from './Menu'
import Actions from './Actions'
import './style.sass'
import Button from '../../components/Button'


class SpaceLayout extends Component {
  componentDidMount() {
    const { loadSpace, space, spaceId } = this.props
    const id = space.id || ''
    if (id.toString() !== spaceId) loadSpace(spaceId)
  }

  render() {
    const { space, isFetching, isInitialized, children } = this.props
    const containerClasses = classNames({
      'space-page-layout__container--shared': !space.isPrivate,
    }, 'space-page-layout__container')

    if (isInitialized && isFetching) {
      return <ContainerLoader text="Loading Space" />
    } else if (isInitialized && !isFetching && !space.isActive) {
      return <Activation />
    } else if (isInitialized && !isFetching && !space.links?.show) {
      return (
        <>
          <div className="space-forbidden">
            <span className="text">You are not allowed to access this space.</span>
            <Link to="/spaces">
              <Button type="primary" size="lg">To Spaces List</Button>
            </Link>
          </div>
        </>
      )
    }

    return (
      <DefaultLayout>
        <div className="space-page-layout">
          <div>
            <div className="space-page-layout__header">
              <div className="space-page-layout__header-row">
                <h1 className="space-page-layout__title">{space.name}</h1>
                <Actions links={space.links} />
              </div>
              <div className="space-page-layout__header-row">
                <div className="space-page-layout__desc">{space.desc}</div>
                <div className="space-page-layout__tags">
                  <TagsList tags={space.tags} />
                </div>
              </div>
            </div>
            <div className="pfda-mr-t20">
              <Tabs space={space} />
            </div>
          </div>
          <div className={containerClasses}>
            <Menu space={space} />
            <div className="space-page-layout__content">
              <div className="pfda-padded-20">
                {children}
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    )
  }
}

SpaceLayout.propTypes = {
  space: PropTypes.shape(SpaceShape),
  isFetching: PropTypes.bool,
  isInitialized: PropTypes.bool,
  spaceId: PropTypes.string.isRequired,
  loadSpace: PropTypes.func,
  location: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
}

SpaceLayout.defaultProps = {
  isInitialized: false,
  loadSpace: () => { },
}

const mapStateToProps = state => ({
  isFetching: spaceIsFetchingSelector(state),
  isInitialized: isInitializedSelector(state),
})

const mapDispatchToProps = dispatch => ({
  loadSpace: (spaceId) => dispatch(fetchSpace(spaceId)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SpaceLayout)

export {
  SpaceLayout,
}
