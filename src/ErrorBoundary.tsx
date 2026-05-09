import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; info: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ info });
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", backgroundColor: "#fee2e2", color: "#991b1b", height: "100vh" }}>
          <h2>Something went wrong in the UI.</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", marginTop: "20px" }}>
            {this.state.info && this.state.info.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: "10px 20px", marginTop: "20px", background: "#991b1b", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
