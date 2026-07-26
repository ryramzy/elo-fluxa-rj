import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] ${this.props.widgetName || 'Widget'} caught error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Conteúdo temporariamente indisponível ({this.props.widgetName || 'Widget'})</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded text-[11px] transition-colors"
          >
            Recarregar Widget
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
