import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const Queue = () => {
    const navigate = useNavigate();
    const { clinics } = useQueue();

    return (
        <div className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-muted)'
                    }}
                >
                    <ChevronLeft size={32} /> 返回
                </button>
                <h1 style={{ flex: 1, margin: 0 }}>即時看診進度</h1>
                <div style={{ width: 80 }}></div>
            </div>

            {/* User Ticket Indicator */}
            {localStorage.getItem('userTicket') && (
                <div style={{
                    background: '#dbeafe', color: '#1e40af', padding: '1rem',
                    borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #93c5fd'
                }}>
                    您的號碼: {JSON.parse(localStorage.getItem('userTicket')).dept} - {JSON.parse(localStorage.getItem('userTicket')).number} 號
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                padding: '0 1rem'
            }}>
                {clinics.map(clinic => (
                    <div key={clinic.id} style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderLeft: `6px solid ${clinic.id % 2 === 0 ? 'var(--primary-color)' : 'var(--secondary-color)'}`
                    }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{clinic.dept}</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{clinic.name}</p>

                        <div style={{
                            margin: '2rem 0',
                            fontSize: '4rem',
                            fontWeight: 'bold',
                            color: 'var(--primary-dark)',
                            fontFamily: 'monospace'
                        }}>
                            {clinic.current}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-muted)',
                            background: '#f1f5f9',
                            padding: '0.5rem 1rem',
                            borderRadius: '2rem'
                        }}>
                            <Users size={18} />
                            <span>等待人數: {clinic.waiting}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Queue;
