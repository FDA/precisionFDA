import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ContainerLoader from '../ContainerLoader'
import { contextIsFetchingSelector, isInitializedSelector } from '../../../reducers/context/selectors'
import fetchContext from '../../../actions/context'
import './style.sass'


class LoaderWrapper extends React.Component {
  componentDidMount() {
    const { onMount, isInitialized } = this.props
    if (!isInitialized) onMount()
  }

  render() {
    const { isFetching, children } = this.props

    // When context fetching is done but context not intialized (due to 401 unauthorized response
    // from server), we still load the page such that public pages are visible
    const content = !isFetching ? children : <ContainerLoader text="Loading precisionFDA" />

    return <div className="pfda-loader-wrapper">{content}</div>
  }
}

LoaderWrapper.propTypes = {
  children: PropTypes.element.isRequired,
  onMount: PropTypes.func,
  isFetching: PropTypes.bool,
  isInitialized: PropTypes.bool,
}

LoaderWrapper.defaultProps = {
  onMount: () => {},
}

const mapStateToProps = state => ({
  isFetching: contextIsFetchingSelector(state),
  isInitialized: isInitializedSelector(state),
})

const mapDispatchToProps = dispatch => ({
  onMount: () => dispatch(fetchContext()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LoaderWrapper)

export {
  LoaderWrapper,
}
