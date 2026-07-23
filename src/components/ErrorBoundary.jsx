import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center dir-rtl">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚡
            </div>
            <h2 className="text-xl font-black text-white">حدث خطأ تقني في الصفحة</h2>
            <p className="text-xs text-slate-300">نظام الحماية رصد خطأ. يرجى تصوير الشاشة وإرسالها للدعم الفني:</p>
            <div className="bg-slate-900 text-red-400 p-4 rounded-xl text-left text-xs font-mono overflow-auto max-h-[300px] mt-4 border border-red-500/30 w-full dir-ltr">
              <p className="font-bold mb-2">Error: {this.state.error?.toString() || 'Unknown Error'}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg transition-colors w-full"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
