import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ContainerLoader from '../ContainerLoader'
import { isInitializedSelector } from '../../../reducers/context/selectors'
import fetchContext from '../../../actions/context'


class LoaderWrapper extends React.Component {
  componentDidMount() {
    const { onMount, isInitialized } = this.props
    if (!isInitialized) onMount()
  }

  render() {
    const { isInitialized, children } = this.props
    const content = isInitialized ? children : <ContainerLoader text="Loading precisionFDA" />

    return <div className="pfda-loader-wrapper">{content}</div>
  }
}

LoaderWrapper.propTypes = {
  children: PropTypes.element.isRequired,
  onMount: PropTypes.func,
  isInitialized: PropTypes.bool,
}

LoaderWrapper.defaultProps = {
  onMount: () => {},
}

const mapStateToProps = state => ({
  isInitialized: isInitializedSelector(state),
})

const mapDispatchToProps = dispatch => ({
  onMount: () => dispatch(fetchContext()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LoaderWrapper)

export {
  LoaderWrapper,
}
