import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Wifi, HelpCircle, Clock } from 'lucide-react';

const Layout = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="kiosk-layout">
            {/* Header */}
            <header className="kiosk-header">
                <div className="header-left">
                    <div className="hospital-logo">🏥</div>
                    <div className="hospital-name">臺北綜合醫院</div>
                </div>
                <div className="header-right">
                    <div className="status-item">
                        <Clock size={20} />
                        <span className="time-display">
                            {formatDate(currentTime)} {formatTime(currentTime)}
                        </span>
                    </div>
                    <div className="status-item">
                        <Wifi size={20} className="text-green-500" />
                        <span>連線正常</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="kiosk-main">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="kiosk-footer">
                <div className="footer-text">系統版本 v1.0.0 | 機台編號: K-01</div>
                <button className="help-btn">
                    <HelpCircle size={24} />
                    <span>呼叫協助</span>
                </button>
            </footer>
        </div>
    );
};

export default Layout;
