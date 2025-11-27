import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useQueue } from '../context/QueueContext';

const QRGenerator = () => {
    const navigate = useNavigate();
    const { clinics } = useQueue();
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [patientId, setPatientId] = useState('A123456789');
    const [patientName, setPatientName] = useState('陳小美');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const generateQRCode = async () => {
        if (!selectedClinic) return;

        const appointmentData = {
            type: 'appointment',
            patientId: patientId,
            patientName: patientName,
            deptId: selectedClinic.id,
            deptName: selectedClinic.dept,
            doctorName: selectedClinic.name,
            appointmentTime: new Date().toISOString()
        };

        try {
            const url = await QRCode.toDataURL(JSON.stringify(appointmentData), {
                width: 400,
                margin: 2,
                color: {
                    dark: '#0ea5e9',
                    light: '#ffffff'
                }
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (selectedClinic) {
            generateQRCode();
        }
    }, [selectedClinic, patientId, patientName]);

    const downloadQRCode = () => {
        const link = document.createElement('a');
        link.download = `appointment-${patientId}.png`;
        link.href = qrCodeUrl;
        link.click();
    };

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
                <h1 style={{ flex: 1, margin: 0 }}>QR Code 產生器（測試用）</h1>
                <div style={{ width: 80 }}></div>
            </div>

            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)' }}>
                        病患身分證字號
                    </label>
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        maxLength={10}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1.2rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)' }}>
                        病患姓名
                    </label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1.2rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '0.5rem'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)' }}>
                        選擇預約診間
                    </label>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {clinics.map(clinic => (
                            <button
                                key={clinic.id}
                                onClick={() => setSelectedClinic(clinic)}
                                style={{
                                    padding: '1rem',
                                    border: selectedClinic?.id === clinic.id ? '2px solid var(--primary-color)' : '2px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    background: selectedClinic?.id === clinic.id ? '#e0f2fe' : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: 'var(--text-color)'
                                }}
                            >
                                {clinic.dept} - {clinic.name}
                            </button>
                        ))}
                    </div>
                </div>

                {qrCodeUrl && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '100%' }} />
                        </div>

                        <div style={{
                            background: '#dbeafe',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            color: '#1e40af'
                        }}>
                            <strong>預約資訊：</strong><br />
                            {patientName} ({patientId})<br />
                            {selectedClinic.dept} - {selectedClinic.name}
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={downloadQRCode}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100%'
                            }}
                        >
                            <Download size={24} />
                            下載 QR Code
                        </button>

                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            💡 提示：下載後可在報到頁面掃描此 QR Code 進行測試
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRGenerator;
