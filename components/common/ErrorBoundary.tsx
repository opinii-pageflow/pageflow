
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  // NOTE: Alguns setups de TS+React (especialmente com moduleResolution=bundler)
  // podem perder a tipagem do Component base em tempo de compilação. Declaramos
  // explicitamente para garantir acesso tipado a props/state e evitar tela branca.
  declare props: Readonly<Props>;
  declare state: Readonly<State>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error at source root:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // HashRouter: garantir que o deploy estático caia na rota correta
    window.location.href = '/#/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center font-['Inter']">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-red-500/10 p-6 rounded-[2.5rem] mb-8 inline-block border border-red-500/20">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Oops! Algo quebrou.</h1>
            <p className="text-zinc-500 mb-10 max-w-md mx-auto font-medium">
              Ocorreu um erro inesperado no sistema. Nossa telemetria já registrou o incidente para análise.
            </p>

            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-3xl text-left mb-10 max-w-2xl w-full border border-white/5 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Trace Log</span>
              </div>
              <code className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
                {this.state.error?.message || "Unknown Application Error"}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                <RefreshCcw className="w-4 h-4" />
                Recarregar Sistema
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 border border-white/5"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
