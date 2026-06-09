import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null); // { message, title, options, resolve }

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const confirm = useCallback((message, title = 'Confirm Action', options = {}) => {
        return new Promise((resolve) => {
            setConfirmModal({
                title,
                message,
                options: {
                    confirmText: 'Confirm',
                    cancelText: 'Cancel',
                    type: 'info', // 'info' or 'danger'
                    ...options
                },
                resolve: (val) => {
                    setConfirmModal(null);
                    resolve(val);
                }
            });
        });
    }, []);

    // Helper functions for common types
    const success = useCallback((msg) => showToast(msg, 'success'), [showToast]);
    const error = useCallback((msg) => showToast(msg, 'error'), [showToast]);
    const info = useCallback((msg) => showToast(msg, 'info'), [showToast]);

    return (
        <NotificationContext.Provider value={{ showToast, success, error, info, confirm }}>
            {children}

            {/* Injected CSS Animations for Toasts and Modals */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(120%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                @keyframes scaleUp {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .playnex-toast-container {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .playnex-toast {
                    pointer-events: auto;
                    width: 340px;
                    padding: 16px;
                    border-radius: 12px;
                    background: rgba(13, 13, 13, 0.95);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .playnex-toast::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                }
                .playnex-toast-success {
                    border: 1px solid rgba(0, 255, 102, 0.25);
                    box-shadow: 0 4px 20px rgba(0, 255, 102, 0.1);
                }
                .playnex-toast-success::before {
                    background: #ffa500; /* Warm orange to fit PlayNex theme */
                }
                .playnex-toast-error {
                    border: 1px solid rgba(255, 60, 0, 0.25);
                    box-shadow: 0 4px 20px rgba(255, 60, 0, 0.1);
                }
                .playnex-toast-error::before {
                    background: var(--color-pink);
                }
                .playnex-toast-info {
                    border: 1px solid rgba(255, 85, 0, 0.25);
                    box-shadow: 0 4px 20px rgba(255, 85, 0, 0.1);
                }
                .playnex-toast-info::before {
                    background: var(--color-cyan);
                }
                .playnex-toast-content {
                    flex: 1;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    font-family: var(--font-family);
                    line-height: 1.4;
                    font-weight: 500;
                    padding-right: 20px;
                }
                .playnex-toast-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0;
                    line-height: 1;
                    transition: var(--transition-smooth);
                    position: absolute;
                    top: 14px;
                    right: 14px;
                }
                .playnex-toast-close:hover {
                    color: #fff;
                }
                .playnex-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999998;
                }
                .playnex-modal-panel {
                    width: 440px;
                    max-width: 90%;
                    background: #0d0d0d;
                    border: 1px solid var(--border-glass-hover);
                    border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    overflow: hidden;
                    font-family: var(--font-family);
                }
                .playnex-modal-header {
                    padding: 20px 24px 12px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--border-glass);
                }
                .playnex-modal-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .playnex-modal-body {
                    padding: 24px;
                    color: var(--text-muted);
                    font-size: 1rem;
                    line-height: 1.5;
                }
                .playnex-modal-footer {
                    padding: 16px 24px 20px 24px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid var(--border-glass);
                }
            `}</style>

            {/* Toasts Render Container */}
            <div className="playnex-toast-container">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id} 
                        className={`playnex-toast playnex-toast-${toast.type}`}
                    >
                        <div className="playnex-toast-content">
                            {toast.message}
                        </div>
                        <button 
                            className="playnex-toast-close"
                            onClick={() => dismissToast(toast.id)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirm Modal Overlay */}
            {confirmModal && (
                <div className="playnex-modal-overlay">
                    <div 
                        className="playnex-modal-panel"
                        style={{
                            border: confirmModal.options.type === 'danger' 
                                ? '1px solid rgba(255, 60, 0, 0.4)' 
                                : '1px solid rgba(255, 85, 0, 0.4)',
                            boxShadow: confirmModal.options.type === 'danger'
                                ? '0 0 30px rgba(255, 60, 0, 0.15)'
                                : '0 0 30px rgba(255, 85, 0, 0.15)'
                        }}
                    >
                        <div className="playnex-modal-header">
                            <span className="playnex-modal-title">
                                {confirmModal.options.type === 'danger' ? '⚠️' : '❓'} {confirmModal.title}
                            </span>
                            <button 
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                                onClick={() => confirmModal.resolve(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="playnex-modal-body">
                            {confirmModal.message}
                        </div>
                        <div className="playnex-modal-footer">
                            <button 
                                className="btn-secondary" 
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                onClick={() => confirmModal.resolve(false)}
                            >
                                {confirmModal.options.cancelText}
                            </button>
                            <button 
                                className={confirmModal.options.type === 'danger' ? 'btn-danger' : 'btn-primary'}
                                style={{ 
                                    padding: '8px 16px', 
                                    fontSize: '0.9rem',
                                    backgroundColor: confirmModal.options.type === 'danger' ? 'var(--color-pink)' : 'var(--color-cyan)',
                                    borderColor: confirmModal.options.type === 'danger' ? 'var(--color-pink)' : 'var(--color-cyan)',
                                    color: '#fff'
                                }}
                                onClick={() => confirmModal.resolve(true)}
                            >
                                {confirmModal.options.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
