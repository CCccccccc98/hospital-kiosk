import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Activity } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const resetSystem = () => {
        if (confirm('確定要重置系統嗎？這將清除所有看診進度和報到資料。')) {
            localStorage.removeItem('clinicsState');
            localStorage.removeItem('userTicket');
            localStorage.removeItem('checkInRecords'); // Clear check-in records
            window.location.reload();
        }
    };

    return (
        <div className="page-container home-page">
            <h1 className="welcome-text">午安，請選擇服務項目</h1>

            <div className="action-cards">
                <button
                    className="action-card primary"
                    onClick={() => navigate('/check-in')}
                >
                    <div className="icon-wrapper">
                        <UserCheck size={64} />
                    </div>
                    <div className="card-content">
                        <h2>我要報到</h2>
                        <p>Check-in</p>
                    </div>
                </button>

                <button
                    className="action-card secondary"
                    onClick={() => navigate('/queue')}
                >
                    <div className="icon-wrapper">
                        <Activity size={64} />
                    </div>
                    <div className="card-content">
                        <h2>看診進度</h2>
                        <p>Queue Status</p>
                    </div>
                </button>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => navigate('/doctor')}
                    style={{
                        background: 'transparent', border: '1px dashed #cbd5e1',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    👨‍⚕️ 醫師看診控制台 (模擬用)
                </button>
                <button
                    onClick={() => navigate('/qr-generator')}
                    style={{
                        background: 'transparent', border: '1px dashed #cbd5e1',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    📱 QR Code 產生器 (測試用)
                </button>
                <button
                    onClick={resetSystem}
                    style={{
                        background: 'transparent', border: '1px dashed #ef4444',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    🔄 重置系統 (測試用)
                </button>
            </div>
        </div>
    );
};

export default Home;
