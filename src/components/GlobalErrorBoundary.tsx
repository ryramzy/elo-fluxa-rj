import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getWhatsAppLink } from '../../constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              ⚡
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-serif mb-2">
                Ops! Algo deu errado no Elo!
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tivemos uma pequena instabilidade temporária. Clique abaixo para recarregar ou fale com Professor.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[10px] text-slate-500 font-mono text-left truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
              >
                Recarregar Aplicação
              </button>

              <a
                href={getWhatsAppLink('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
              >
                💬 Falar com Professor no WhatsApp
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
