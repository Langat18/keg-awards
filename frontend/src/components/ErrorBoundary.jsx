import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl">This page stopped working</h1>
          <p className="mt-2 text-muted">Reload to try again. If it keeps happening, let the ICT office know what you were doing.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 h-10 rounded bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
