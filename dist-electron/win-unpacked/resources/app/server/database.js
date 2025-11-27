import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, 'hospital.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, {});

// Initialize database schema
export async function initDatabase() {
    await db.read();

    // Set default data if database is empty
    if (!db.data) {
        db.data = {
            patients: [],
            clinics: [],
            checkinRecords: [],
            operationLogs: []
        };
    }

    // Ensure all arrays exist
    db.data.patients = db.data.patients || [];
    db.data.clinics = db.data.clinics || [];
    db.data.checkinRecords = db.data.checkinRecords || [];
    db.data.operationLogs = db.data.operationLogs || [];

    // Insert initial clinic data if empty
    if (db.data.clinics.length === 0) {
        db.data.clinics = [
            { id: 1, name: '李大衛 醫師', dept: '內科一診', current: 12, waiting: 3, last_ticket: 15 },
            { id: 2, name: '陳淑芬 醫師', dept: '內科二診', current: 8, waiting: 5, last_ticket: 13 },
            { id: 3, name: '王建國 醫師', dept: '外科一診', current: 25, waiting: 1, last_ticket: 26 },
            { id: 4, name: '林美玲 醫師', dept: '外科二診', current: 18, waiting: 4, last_ticket: 22 },
            { id: 5, name: '張小寶 醫師', dept: '兒科一診', current: 5, waiting: 8, last_ticket: 13 },
            { id: 6, name: '劉光明 醫師', dept: '眼科一診', current: 30, waiting: 2, last_ticket: 32 },
        ];
    }

    // Insert sample patients if empty
    if (db.data.patients.length === 0) {
        db.data.patients = [
            { id: 'A123456789', name: '陳小美', phone: '0912345678', created_at: new Date().toISOString() },
            { id: 'B234567890', name: '林志豪', phone: '0923456789', created_at: new Date().toISOString() },
            { id: 'C345678901', name: '張雅婷', phone: '0934567890', created_at: new Date().toISOString() },
            { id: 'D456789012', name: '王大明', phone: '0945678901', created_at: new Date().toISOString() },
            { id: 'E567890123', name: '李國華', phone: '0956789012', created_at: new Date().toISOString() },
        ];
    }

    await db.write();
    console.log('✅ Database initialized successfully');
}

// Patient operations
export const patientDB = {
    getById: async (id) => {
        await db.read();
        return db.data.patients.find(p => p.id === id);
    },
    create: async (id, name, phone) => {
        await db.read();
        const patient = { id, name, phone, created_at: new Date().toISOString() };
        db.data.patients.push(patient);
        await db.write();
        return patient;
    }
};

// Clinic operations
export const clinicDB = {
    getAll: async () => {
        await db.read();
        return db.data.clinics;
    },
    getById: async (id) => {
        await db.read();
        return db.data.clinics.find(c => c.id === id);
    },
    updateWaiting: async (id, waiting) => {
        await db.read();
        const clinic = db.data.clinics.find(c => c.id === id);
        if (clinic) {
            clinic.waiting = waiting;
            await db.write();
        }
        return clinic;
    },
    updateCurrent: async (id, current, waiting) => {
        await db.read();
        const clinic = db.data.clinics.find(c => c.id === id);
        if (clinic) {
            clinic.current = current;
            clinic.waiting = waiting;
            await db.write();
        }
        return clinic;
    },
    getNextTicket: async (id) => {
        await db.read();
        const clinic = db.data.clinics.find(c => c.id === id);
        if (clinic) {
            const nextTicket = (clinic.last_ticket || 0) + 1;
            clinic.last_ticket = nextTicket;
            await db.write();
            return nextTicket;
        }
        return 1;
    }
};

// Check-in operations
export const checkinDB = {
    create: async (patientId, clinicId, ticketNumber) => {
        await db.read();
        const record = {
            id: db.data.checkinRecords.length + 1,
            patient_id: patientId,
            clinic_id: clinicId,
            ticket_number: ticketNumber,
            status: 'waiting',
            created_at: new Date().toISOString(),
            called_at: null
        };
        db.data.checkinRecords.push(record);
        await db.write();
        return record;
    },
    hasActiveCheckin: async (patientId, clinicId) => {
        await db.read();
        const record = db.data.checkinRecords.find(
            r => r.patient_id === patientId && r.clinic_id === clinicId && r.status === 'waiting'
        );
        return !!record;
    },
    updateStatus: async (clinicId, ticketNumber, status) => {
        await db.read();
        const record = db.data.checkinRecords.find(
            r => r.clinic_id === clinicId && r.ticket_number === ticketNumber && r.status === 'waiting'
        );
        if (record) {
            record.status = status;
            record.called_at = new Date().toISOString();
            await db.write();
        }
        return record;
    },
    getByClinic: async (clinicId) => {
        await db.read();
        const records = db.data.checkinRecords.filter(
            r => r.clinic_id === clinicId && r.status === 'waiting'
        );
        // Join with patient data
        return records.map(r => {
            const patient = db.data.patients.find(p => p.id === r.patient_id);
            return {
                ...r,
                patient_name: patient ? patient.name : 'Unknown'
            };
        }).sort((a, b) => a.ticket_number - b.ticket_number);
    }
};

// Operation logs
export const logDB = {
    create: async (action, clinicId, patientId, ticketNumber, details) => {
        await db.read();
        const log = {
            id: db.data.operationLogs.length + 1,
            action,
            clinic_id: clinicId,
            patient_id: patientId,
            ticket_number: ticketNumber,
            details,
            created_at: new Date().toISOString()
        };
        db.data.operationLogs.push(log);
        await db.write();
        return log;
    },
    getRecent: async (limit = 50) => {
        await db.read();
        return db.data.operationLogs
            .slice(-limit)
            .reverse();
    }
};

export default db;
