'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: string | null
}

export class SafeWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            Page Error
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center max-w-md">
            {this.state.error || 'Something went wrong loading this page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
