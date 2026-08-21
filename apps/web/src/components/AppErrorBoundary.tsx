import { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, details: ErrorInfo) {
    console.error("LemonBooks screen failed", error, details.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="fatal-error" role="alert">
      <a className="brand" href="/"><span className="brand-mark">L</span><span>LemonBooks</span></a>
      <div><p className="eyebrow">WE HIT A PROBLEM</p><h1>This screen couldn’t open</h1><p>Your account and saved information are safe. Refresh the page to try again.</p><button className="primary-button" onClick={() => window.location.reload()}>Refresh LemonBooks</button></div>
    </main>;
  }
}
