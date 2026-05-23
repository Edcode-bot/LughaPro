"use client";

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type ErrorBoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-luxury">
          <AlertTriangle className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-4 font-serif text-3xl font-black text-forest">Something needs a quick refresh</h2>
          <p className="mt-2 text-forest/65">We hit a small bump while loading this page. Your progress is safe.</p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      )
    }

    return this.props.children
  }
}
