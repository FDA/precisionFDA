import React from 'react'
import { theme } from '../styles/theme'

interface IState {
  hasError: boolean;
  message: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, Pick<IState, 'hasError'>> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(/* error: Error */): Pick<IState, 'hasError'> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }
  
  componentDidCatch(/* error: Error, errorInfo: React.ErrorInfo */): void {
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

export class ErrorBoundaryDetails extends React.Component<ErrorBoundaryProps, IState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): IState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, message: error.message }
  }
  
  componentDidCatch(/* error: Error, errorInfo: React.ErrorInfo */): void {
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
