import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Top-level safety net. The `.plr` parser itself never throws — every
 * failure mode is reported through a typed result (see parser/types.ts) —
 * but this still guards against any unexpected runtime error anywhere in
 * the tree so a bad render can't take down the whole app silently.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in Journey Ledger:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="center-stage" role="alert">
          <div className="status-banner" data-kind="error">
            <span className="status-banner__title">SOMETHING WENT WRONG</span>
            <p className="status-banner__body">
              The app hit an unexpected error and had to stop rendering this part of the page. Reloading usually
              fixes it; your save file was never uploaded anywhere, so there's nothing to worry about there.
            </p>
            <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
