import React, { createContext, useState, useEffect, useContext } from 'react';
import { clinicAPI, APIError } from '../services/api';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [clinics, setClinics] = useState([]);
    const [callingAlert, setCallingAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch clinics from backend
    const fetchClinics = async () => {
        try {
            const data = await clinicAPI.getAll();
            setClinics(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch clinics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchClinics();
    }, []);

    // Polling: refresh every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchClinics();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Notification sound using Web Audio API
    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const beep = (frequency, duration, delay = 0) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);

                oscillator.start(audioContext.currentTime + delay);
                oscillator.stop(audioContext.currentTime + delay + duration);
            };

            // Ding-dong sound
            beep(800, 0.2, 0);
            beep(600, 0.3, 0.25);
        } catch (error) {
            console.error('Audio playback failed:', error);
        }
    };

    // Check if calling alert should be shown
    const checkCallingAlert = (clinicId, currentNumber) => {
        const userTicketStr = localStorage.getItem('userTicket');
        if (userTicketStr) {
            try {
                const userTicket = JSON.parse(userTicketStr);
                const clinic = clinics.find(c => c.id === clinicId);

                if (clinic && userTicket.dept === clinic.dept && currentNumber === userTicket.number) {
                    playNotificationSound();
                    setCallingAlert({ dept: clinic.dept, number: currentNumber });
                    localStorage.removeItem('userTicket');
                }
            } catch (err) {
                console.error('Error parsing user ticket:', err);
            }
        }
    };

    // Watch for current number changes
    useEffect(() => {
        Array.isArray(clinics) && clinics.forEach(clinic => {
            checkCallingAlert(clinic.id, clinic.current);
        });
    }, [clinics]);

    // Action: Doctor Calls Next Patient
    const callNext = async (deptName) => {
        try {
            const clinic = clinics.find(c => c.dept === deptName);
            if (!clinic) {
                throw new Error('Clinic not found');
            }

            const result = await clinicAPI.callNext(clinic.id);

            // Update local state immediately for better UX
            setClinics(prev => prev.map(c =>
                c.id === clinic.id
                    ? { ...c, current: result.current, waiting: result.waiting }
                    : c
            ));

            return { success: true };
        } catch (err) {
            console.error('Failed to call next:', err);
            if (err instanceof APIError) {
                throw err;
            }
            throw new Error('?´Ë?Â§±Ê?ÔºåË?Á®çÂ??çË©¶');
        }
    };

    const closeAlert = () => setCallingAlert(null);

    return (
        <QueueContext.Provider value={{
            clinics,
            callingAlert,
            closeAlert,
            callNext,
            loading,
            error,
            refreshClinics: fetchClinics
        }}>
            {children}
            {/* Global Alert Modal */}
            {callingAlert && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s'
                }}>
                    <div style={{
                        background: 'white', padding: '3rem', borderRadius: '2rem',
                        textAlign: 'center', maxWidth: '600px', width: '90%',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}>
                        <div style={{
                            fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem'
                        }}>
                            Ë´ãÂç≥?ªÂ∞±Ë®?
                        </div>
                        <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{callingAlert.dept}</h2>
                        <div style={{
                            fontSize: '6rem', fontWeight: 'bold', color: '#ef4444',
                            margin: '1rem 0', fontFamily: 'monospace'
                        }}>
                            {callingAlert.number}
                        </div>
                        <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Ë´ãÂ?ÂæÄË®∫È??±Âà∞
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '1.5rem', padding: '1rem 3rem', width: '100%', border: 'none', borderRadius: '1rem', background: 'var(--primary-color)', color: 'white', cursor: 'pointer' }}
                            onClick={closeAlert}
                        >
                            ?ëÁü•?ì‰?
                        </button>
                    </div>
                </div>
            )}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);
