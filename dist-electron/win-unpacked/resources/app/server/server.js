import express from 'express';
import cors from 'cors';
import { initDatabase, patientDB, clinicDB, checkinDB, logDB } from './database.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// ============ API Routes ============

// Get all clinics
app.get('/api/clinics', (req, res) => {
    try {
        const clinics = clinicDB.getAll();
        res.json(clinics);
    } catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({ error: 'Failed to fetch clinics' });
    }
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
    try {
        const { id } = req.params;
        const patient = patientDB.getById(id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// Check-in endpoint
app.post('/api/checkin', (req, res) => {
    try {
        const { patientId, clinicId } = req.body;

        // Validate input
        if (!patientId || !clinicId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if patient exists
        const patient = patientDB.getById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check if clinic exists
        const clinic = clinicDB.getById(clinicId);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }

        // Check for duplicate check-in
        if (checkinDB.hasActiveCheckin(patientId, clinicId)) {
            return res.status(409).json({
                error: 'DUPLICATE_CHECKIN',
                message: '您已經報到過此診間了！'
            });
        }

        // Check clinic capacity
        if (clinic.waiting >= 10) {
            return res.status(409).json({
                error: 'CLINIC_FULL',
                message: '此診間目前已額滿！'
            });
        }

        // Generate ticket number
        const ticketNumber = clinicDB.getNextTicket(clinicId);

        // Create check-in record
        checkinDB.create(patientId, clinicId, ticketNumber);

        // Update clinic waiting count
        clinicDB.updateWaiting(clinicId, clinic.waiting + 1);

        // Log the operation
        logDB.create('CHECKIN', clinicId, patientId, ticketNumber,
            `Patient ${patient.name} checked in to ${clinic.dept}`);

        res.json({
            success: true,
            ticketNumber,
            clinic: {
                id: clinic.id,
                name: clinic.name,
                dept: clinic.dept,
                waiting: clinic.waiting + 1
            },
            patient: {
                id: patient.id,
                name: patient.name
            }
        });

    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({ error: 'Check-in failed' });
    }
});

// Call next patient
app.post('/api/call-next', (req, res) => {
    try {
        const { clinicId } = req.body;

        if (!clinicId) {
            return res.status(400).json({ error: 'Missing clinic ID' });
        }

        const clinic = clinicDB.getById(clinicId);
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }

        // Calculate next number
        const nextNumber = clinic.current + 1;

        // Update clinic status
        const newWaiting = Math.max(0, clinic.waiting - 1);
        clinicDB.updateCurrent(clinicId, nextNumber, newWaiting);

        // Update check-in record status
        checkinDB.updateStatus(clinicId, nextNumber, 'called');

        // Log the operation
        logDB.create('CALL_NEXT', clinicId, null, nextNumber,
            `Called number ${nextNumber} in ${clinic.dept}`);

        res.json({
            success: true,
            current: nextNumber,
            waiting: newWaiting,
            clinic: {
                id: clinic.id,
                name: clinic.name,
                dept: clinic.dept
            }
        });

    } catch (error) {
        console.error('Error calling next patient:', error);
        res.status(500).json({ error: 'Failed to call next patient' });
    }
});

// Get operation logs
app.get('/api/logs', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = logDB.getRecent(limit);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Get check-in records for a clinic
app.get('/api/checkins/:clinicId', (req, res) => {
    try {
        const { clinicId } = req.params;
        const records = checkinDB.getByClinic(parseInt(clinicId));
        res.json(records);
    } catch (error) {
        console.error('Error fetching check-in records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🏥 Hospital Kiosk Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   GET  /api/clinics`);
    console.log(`   GET  /api/patients/:id`);
    console.log(`   POST /api/checkin`);
    console.log(`   POST /api/call-next`);
    console.log(`   GET  /api/logs`);
    console.log(`   GET  /api/checkins/:clinicId`);
});
