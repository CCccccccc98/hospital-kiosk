import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Printer, User, Stethoscope, QrCode, AlertCircle } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import QRScanner from '../components/QRScanner';
import { validateTaiwanID } from '../utils/validateID';
import { patientAPI, checkinAPI, APIError } from '../services/api';

const CheckIn = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [idNumber, setIdNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [keypadMode, setKeypadMode] = useState('ALPHA');
    const [patientData, setPatientData] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [ticketNumber, setTicketNumber] = useState(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [error, setError] = useState(null);
    const { clinics, refreshClinics } = useQueue();



    // Removed: generatePatientData - now using real API

    const handleKeyPress = (key) => {
        if (key === 'DEL') {
            setIdNumber(prev => {
                const newId = prev.slice(0, -1);
                if (newId.length === 0) setKeypadMode('ALPHA');
                return newId;
            });
        } else if (key === 'CLR') {
            setIdNumber('');
            setKeypadMode('ALPHA');
        } else {
            if (idNumber.length < 10) {
                setIdNumber(prev => prev + key);
                if (keypadMode === 'ALPHA') {
                    setKeypadMode('NUMERIC');
                }
            }
        }
    };

    const handleIdSubmit = async () => {
        if (idNumber.length < 10) return;

        // Convert to uppercase and validate ID format
        const normalizedId = idNumber.toUpperCase();
        if (!validateTaiwanID(normalizedId)) {
            setError('身分證字號格式不正確，請重新輸入');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Query patient from backend
            const patient = await patientAPI.getById(normalizedId);
            setPatientData(patient);
            setStep(2); // Go to Doctor Selection
        } catch (err) {
            if (err instanceof APIError && err.status === 404) {
                setError('查無此患者資料，請確認身分證字號或洽櫃台人員');
            } else {
                setError(err.message || '查詢失敗，請稍後再試');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorSelect = (doc) => {
        if (doc.status === 'FULL') return;
        setSelectedDoctor(doc);
        setStep(3); // Go to Confirmation
    };

    const handleFinalCheckIn = async () => {
        setLoading(true);
        setError(null);

        try {
            // Execute check-in via API
            const result = await checkinAPI.checkIn(patientData.id, selectedDoctor.id);

            setTicketNumber(result.ticketNumber);

            // Save to localStorage for user tracking
            localStorage.setItem('userTicket', JSON.stringify({
                number: result.ticketNumber,
                dept: result.clinic.dept,
                doctor: result.clinic.name
            }));

            // Refresh clinics to get updated waiting count
            await refreshClinics();

            setStep(4); // Success
            setTimeout(() => navigate('/'), 5000);

        } catch (err) {
            if (err instanceof APIError) {
                if (err.code === 'DUPLICATE_CHECKIN') {
                    setError('您已經報到過此診間了！請勿重複報到。');
                } else if (err.code === 'CLINIC_FULL') {
                    setError('此診間目前已額滿！請選擇其他診間或稍後再試。');
                } else {
                    setError(err.message || '報到失敗，請稍後再試');
                }
            } else {
                setError('報到失敗，請稍後再試');
            }
            setStep(2); // Return to doctor selection
        } finally {
            setLoading(false);
        }
    };

    const handleQRScan = (data) => {
        // QR Code data format: { type, patientId, patientName, deptId, deptName, doctorName }
        setShowQRScanner(false);

        // Set patient data
        setPatientData({
            name: data.patientName,
            id: data.patientId
        });

        // Find and set the doctor
        const clinic = clinics.find(c => c.id === data.deptId);
        if (clinic) {
            setSelectedDoctor(clinic);
            setStep(3); // Go directly to confirmation
        } else {
            alert('找不到對應的診間');
        }
    };

    return (
        <div className="page-container">
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                {step < 4 && (
                    <button
                        onClick={() => {
                            if (step === 1) navigate('/');
                            else if (step === 2) setStep(1);
                            else if (step === 3) setStep(2);
                        }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-muted)'
                        }}
                    >
                        <ChevronLeft size={32} /> 返回
                    </button>
                )}
                <h1 style={{ flex: 1, margin: 0 }}>
                    {step === 1 ? '請輸入身分證字號' :
                        step === 2 ? '請選擇看診醫師' :
                            step === 3 ? '確認掛號資訊' : '報到成功'}
                </h1>
                <div style={{ width: 80 }}></div>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`} />
                ))}
            </div>

            <div className="checkin-container">

                {/* Step 1: Input */}
                {step === 1 && (
                    <>
                        <div className="input-display">
                            <input
                                type="text"
                                className="id-input"
                                value={idNumber}
                                placeholder="請輸入號碼"
                                readOnly
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                border: '2px solid #ef4444',
                                borderRadius: '1rem',
                                padding: '1rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#991b1b',
                                maxWidth: '500px',
                                width: '100%'
                            }}>
                                <AlertCircle size={24} />
                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{error}</span>
                            </div>
                        )}

                        <div className="keypad-container">
                            <div className="keypad-tabs">
                                <button
                                    className={`tab-btn ${keypadMode === 'ALPHA' ? 'active' : ''}`}
                                    onClick={() => setKeypadMode('ALPHA')}
                                >
                                    英文 (ABC)
                                </button>
                                <button
                                    className={`tab-btn ${keypadMode === 'NUMERIC' ? 'active' : ''}`}
                                    onClick={() => setKeypadMode('NUMERIC')}
                                >
                                    數字 (123)
                                </button>
                            </div>

                            {keypadMode === 'NUMERIC' && (
                                <div className="keypad numeric">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <button key={num} className="key-btn" onClick={() => handleKeyPress(num)}>
                                            {num}
                                        </button>
                                    ))}
                                    <button className="key-btn danger" onClick={() => handleKeyPress('CLR')}>清除</button>
                                    <button className="key-btn" onClick={() => handleKeyPress(0)}>0</button>
                                    <button className="key-btn" onClick={() => handleKeyPress('DEL')}>⌫</button>
                                </div>
                            )}

                            {keypadMode === 'ALPHA' && (
                                <div className="keypad alpha-qwerty">
                                    {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
                                        <div key={rowIndex} className="qwerty-row">
                                            {row.split('').map(char => (
                                                <button key={char} className="key-btn" onClick={() => handleKeyPress(char)}>
                                                    {char}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="qwerty-row">
                                        <button className="key-btn danger wide" onClick={() => handleKeyPress('DEL')}>⌫ 刪除</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ width: '100%', maxWidth: '500px', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowQRScanner(true)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: 'white',
                                    border: '2px solid var(--primary-color)',
                                    color: 'var(--primary-color)'
                                }}
                            >
                                <QrCode size={24} />
                                掃描預約 QR Code
                            </button>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                                <span>或</span>
                                <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                            </div>

                            <button
                                className={`btn btn-primary ${idNumber.length < 10 ? 'disabled' : ''}`}
                                style={{ width: '100%', opacity: idNumber.length < 10 ? 0.5 : 1 }}
                                onClick={handleIdSubmit}
                                disabled={idNumber.length < 10 || loading}
                            >
                                {loading ? '查詢中...' : '下一步'}
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Doctor Selection */}
                {step === 2 && (
                    <div className="doctor-grid">
                        {clinics.map(clinic => (
                            <button
                                key={clinic.id}
                                className={`doctor-card ${clinic.waiting >= 10 ? 'full' : ''}`}
                                onClick={() => handleDoctorSelect(clinic)}
                                disabled={clinic.waiting >= 10}
                            >
                                <div className="doc-icon">
                                    <Stethoscope size={32} />
                                </div>
                                <div className="doc-info">
                                    <h3>{clinic.dept}</h3>
                                    <div className="doc-name">{clinic.name}</div>
                                    <div className={`doc-status ${clinic.waiting >= 10 ? 'status-full' : 'status-ok'}`}>
                                        {clinic.waiting >= 10 ? '額滿 Full' : `尚有名額 (候診: ${clinic.waiting})`}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && patientData && selectedDoctor && (
                    <div className="confirm-card">
                        <h2 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>請確認您的資訊</h2>
                        <div className="patient-info">
                            <span className="label">姓名</span>
                            <span className="value">{patientData.name}</span>

                            <span className="label">身分證字號</span>
                            <span className="value">{patientData.id}</span>

                            <span className="label">掛號科別</span>
                            <span className="value">{selectedDoctor.dept}</span>

                            <span className="label">看診醫師</span>
                            <span className="value">{selectedDoctor.name}</span>
                        </div>

                        <div className="actions">
                            <button className="btn btn-outline" onClick={() => setStep(2)}>重新選擇</button>
                            <button className="btn btn-primary" onClick={handleFinalCheckIn} disabled={loading}>
                                {loading ? '處理中...' : '確認報到'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && patientData && selectedDoctor && (
                    <div className="success-container">
                        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h2>報到成功！</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>請領取您的號碼牌並至候診區等候</p>

                        <div className="ticket">
                            <div style={{ borderBottom: '2px dashed #cbd5e1', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedDoctor.dept}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{new Date().toLocaleDateString()}</div>
                            </div>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                {ticketNumber}
                            </div>
                            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>前方尚有 {selectedDoctor.waiting} 人</div>

                            {/* Wait time estimation */}
                            <div style={{
                                background: '#f0f9ff',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginTop: '1rem'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.25rem' }}>預估等待時間</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0284c7' }}>
                                    約 {selectedDoctor.waiting * 10} 分鐘
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    * 實際時間可能因看診情況而異
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Printer size={20} className="animate-pulse" />
                            <span>正在列印號碼牌...</span>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '2rem', width: '200px' }}
                            onClick={() => navigate('/')}
                        >
                            返回首頁
                        </button>
                    </div>
                )}

            </div>

            {/* QR Scanner Modal */}
            {
                showQRScanner && (
                    <QRScanner
                        onScanSuccess={handleQRScan}
                        onClose={() => setShowQRScanner(false)}
                    />
                )
            }
        </div >
    );
};

export default CheckIn;
