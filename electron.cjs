const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

let mainWindow;
let server;

// Import database functions
let initDatabase, patientDB, clinicDB, checkinDB, logDB;

// Start the Express server
async function startServer() {
    try {
        // Dynamically import the database module
        const { pathToFileURL } = require('url');
        const dbPath = path.join(__dirname, 'server', 'database.js');

        try {
            const dbModule = await import(pathToFileURL(dbPath).href);
            initDatabase = dbModule.initDatabase;
            patientDB = dbModule.patientDB;
            clinicDB = dbModule.clinicDB;
            checkinDB = dbModule.checkinDB;
            logDB = dbModule.logDB;
        } catch (dbError) {
            dialog.showErrorBox('Database Error', `Failed to load database module from ${dbPath}:\n${dbError.message}\n${dbError.stack}`);
            return;
        }

        const expressApp = express();
        const PORT = 3001;

        // Middleware
        expressApp.use(cors());
        expressApp.use(express.json());

        // Initialize database
        try {
            await initDatabase();
        } catch (initError) {
            dialog.showErrorBox('Database Init Error', `Failed to initialize database:\n${initError.message}`);
            return;
        }

        // ============ API Routes ============

        // Get all clinics
        expressApp.get('/api/clinics', async (req, res) => {
            try {
                const clinics = await clinicDB.getAll();
                res.json(clinics);
            } catch (error) {
                console.error('Error fetching clinics:', error);
                res.status(500).json({ error: 'Failed to fetch clinics' });
            }
        });

        // Get patient by ID
        expressApp.get('/api/patients/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const patient = await patientDB.getById(id);

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
        expressApp.post('/api/checkin', async (req, res) => {
            try {
                const { patientId, clinicId } = req.body;

                if (!patientId || !clinicId) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }

                const patient = await patientDB.getById(patientId);
                if (!patient) {
                    return res.status(404).json({ error: 'Patient not found' });
                }

                const clinic = await clinicDB.getById(clinicId);
                if (!clinic) {
                    return res.status(404).json({ error: 'Clinic not found' });
                }

                if (await checkinDB.hasActiveCheckin(patientId, clinicId)) {
                    return res.status(409).json({
                        error: 'DUPLICATE_CHECKIN',
                        message: '您已經報到過此診間了！'
                    });
                }

                if (clinic.waiting >= 10) {
                    return res.status(409).json({
                        error: 'CLINIC_FULL',
                        message: '此診間目前已額滿！'
                    });
                }

                const ticketNumber = await clinicDB.getNextTicket(clinicId);
                await checkinDB.create(patientId, clinicId, ticketNumber);
                await clinicDB.updateWaiting(clinicId, clinic.waiting + 1);
                await logDB.create('CHECKIN', clinicId, patientId, ticketNumber,
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
        expressApp.post('/api/call-next', async (req, res) => {
            try {
                const { clinicId } = req.body;

                if (!clinicId) {
                    return res.status(400).json({ error: 'Missing clinic ID' });
                }

                const clinic = await clinicDB.getById(clinicId);
                if (!clinic) {
                    return res.status(404).json({ error: 'Clinic not found' });
                }

                const nextNumber = clinic.current + 1;
                const newWaiting = Math.max(0, clinic.waiting - 1);
                await clinicDB.updateCurrent(clinicId, nextNumber, newWaiting);
                await checkinDB.updateStatus(clinicId, nextNumber, 'called');
                await logDB.create('CALL_NEXT', clinicId, null, nextNumber,
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
        expressApp.get('/api/logs', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const logs = await logDB.getRecent(limit);
                res.json(logs);
            } catch (error) {
                console.error('Error fetching logs:', error);
                res.status(500).json({ error: 'Failed to fetch logs' });
            }
        });

        // Get check-in records for a clinic
        expressApp.get('/api/checkins/:clinicId', async (req, res) => {
            try {
                const { clinicId } = req.params;
                const records = await checkinDB.getByClinic(parseInt(clinicId));
                res.json(records);
            } catch (error) {
                console.error('Error fetching check-in records:', error);
                res.status(500).json({ error: 'Failed to fetch records' });
            }
        });

        // Health check
        expressApp.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // Start server
        server = expressApp.listen(PORT, () => {
            console.log(`🏥 Hospital Kiosk Server running on http://localhost:${PORT}`);
        }).on('error', (err) => {
            dialog.showErrorBox('Server Error', `Failed to start server on port ${PORT}:\n${err.message}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        dialog.showErrorBox('Fatal Error', `Unexpected error in server startup:\n${error.message}\n${error.stack}`);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        fullscreen: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'public', 'icon.png'),
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`;

    // Wait for server to start
    setTimeout(() => {
        mainWindow.loadURL(startUrl);
    }, 2000);

    // Always open DevTools for debugging
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    if (server) {
        server.close();
    }
});
