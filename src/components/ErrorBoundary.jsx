import React, { Component } from 'react';

/**
 * React Error Boundary Component
 * 捕捉渲染錯誤並顯示友善的錯誤訊息
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'var(--bg-color)'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1rem',
                        boxShadow: 'var(--shadow-lg)',
                        maxWidth: '600px'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>系統發生錯誤</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            很抱歉，系統遇到了一些問題。請嘗試重新整理頁面或返回首頁。
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                background: '#fef2f2',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '2rem',
                                textAlign: 'left',
                                fontSize: '0.9rem'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    錯誤詳情 (開發模式)
                                </summary>
                                <pre style={{ overflow: 'auto', fontSize: '0.8rem' }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                重新整理
                            </button>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'white',
                                    color: 'var(--text-color)',
                                    border: '2px solid #cbd5e1',
                                    borderRadius: '0.5rem',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                返回首頁
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
