import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserPlus, Volume2 } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const Doctor = () => {
    const navigate = useNavigate();
    const { clinics, callNext } = useQueue();

    return (
        <div className="page-container" style={{ background: '#f8fafc' }}>
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
                <h1 style={{ flex: 1, margin: 0 }}>醫師看診控制台</h1>
                <div style={{ width: 80 }}></div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem',
                padding: '0 1rem'
            }}>
                {clinics.map(clinic => (
                    <div key={clinic.id} style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-md)',
                        borderLeft: `6px solid ${clinic.id % 2 === 0 ? 'var(--primary-color)' : 'var(--secondary-color)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>{clinic.dept}</h2>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{clinic.name}</p>
                            </div>
                            <div style={{
                                background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '1rem',
                                fontSize: '0.9rem', color: 'var(--text-muted)'
                            }}>
                                等待: {clinic.waiting} 人
                            </div>
                        </div>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>目前號碼</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-dark)', fontFamily: 'monospace' }}>
                                {clinic.current}
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                fontSize: '1.2rem', padding: '1rem'
                            }}
                            onClick={async () => {
                                try {
                                    await callNext(clinic.dept);
                                } catch (error) {
                                    alert('叫號失敗：' + error.message);
                                }
                            }}
                        >
                            <Volume2 size={24} />
                            叫號 (下一位)
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doctor;
