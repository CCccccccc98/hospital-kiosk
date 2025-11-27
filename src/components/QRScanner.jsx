import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error(err));
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scanning errors (happens continuously while scanning)
                }
            );
            setScanning(true);
        } catch (err) {
            setError('無法啟動相機，請確認已允許相機權限');
            console.error(err);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                setScanning(false);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleScanSuccess = async (decodedText) => {
        await stopScanning();
        try {
            const data = JSON.parse(decodedText);
            if (data.type === 'appointment') {
                onScanSuccess(data);
            } else {
                setError('無效的 QR Code 格式');
            }
        } catch (err) {
            setError('無法解析 QR Code 資料');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setError(null);
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            const decodedText = await html5QrCode.scanFile(file, true);
            handleScanSuccess(decodedText);
        } catch (err) {
            setError('無法從圖片中讀取 QR Code');
            console.error(err);
        }
    };

    const handleClose = async () => {
        await stopScanning();
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                position: 'relative'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={32} />
                </button>

                <h2 style={{ marginTop: 0, color: 'var(--primary-dark)' }}>掃描 QR Code</h2>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        {error}
                    </div>
                )}

                <div id="qr-reader" style={{
                    width: '100%',
                    marginBottom: '1rem',
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                }}></div>

                {!scanning && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={startScanning}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100%'
                            }}
                        >
                            <Camera size={24} />
                            開啟相機掃描
                        </button>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '0.75rem',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '1.25rem',
                            fontWeight: 600
                        }}>
                            <Upload size={24} />
                            上傳 QR Code 圖片
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                )}

                {scanning && (
                    <button
                        className="btn btn-outline"
                        onClick={stopScanning}
                        style={{ width: '100%' }}
                    >
                        停止掃描
                    </button>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
