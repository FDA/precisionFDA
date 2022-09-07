import React from 'react'
import {theme} from '../styles/theme'

interface IState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<any, IState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false } as any
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h3>Something stopped working. Try refreshing the page and giving it some time.</h3>
    }
    return this.props.children
  }
}

export class ErrorBoundaryDetails extends React.Component<any, IState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, message: '' } as { hasError: boolean, message: string}
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, message: error.message }
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
  }
  render() {
    if (this.state.hasError && this.state.message) {
      // You can render any custom fallback UI
      return (
        <div style={{ color: theme.colors.darkRed, padding: 4 }}>
          <div><b>An error occurred:</b> {this.state.message}</div>
        </div>
      )
    }
    return this.props.children
  }
}
