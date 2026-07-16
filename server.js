<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const pool = require('./database');

// Load env variables
require('dotenv').config();

// Twilio Client (loaded lazily so server starts even without credentials)
let twilioClient = null;
function getTwilioClient() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'BURAYA_AUTH_TOKEN_YAZIN') {
        try {
            twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            console.log('✅ Twilio client initialized.');
        } catch(e) {
            console.warn('⚠️  Twilio package not found. Run: npm install twilio');
        }
    }
    return twilioClient;
}
// Automatic database tables initialization and seeding check
async function initializeDatabase() {
    console.log("Checking database tables...");
    let connection;
    try {
        connection = await pool.getConnection();
        
        // 1. Create tables if they don't exist by executing schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (let statement of statements) {
                await connection.query(statement);
            }
            console.log("Database tables verified/created.");
        }
        // Delete all users except Emre on server startup to clean test accounts
        await connection.query("DELETE FROM users WHERE email != 'emre@brener.com.tr'");
        
        // 2. Check if users is empty (or has only Emre left, which is fine)
        const [userRows] = await connection.query("SELECT COUNT(*) as count FROM users");
        if (userRows[0].count === 0) {
            // Check if Brener Group company exists, else create it
            const [compRows] = await connection.query("SELECT id FROM companies WHERE name = 'Brener Group'");
            let companyId;
            if (compRows.length > 0) {
                companyId = compRows[0].id;
            } else {
                const [compResult] = await connection.query("INSERT INTO companies (name) VALUES ('Brener Group')");
                companyId = compResult.insertId;
            }
            console.log("Database is empty. Running automatic seed...");
            
            // Create default users (only Emre remains)
            const defaultUsers = [
                { name: 'Emre Türedi', email: 'emre@brener.com.tr', password: 'Emre3wr3', role: 'admin' }
            ];
            
            for (let user of defaultUsers) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(user.password, salt);
                await connection.query(
                    "INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                    [companyId, user.name, user.email, passwordHash, user.role]
                );
            }
            console.log("Default users created.");
            
            // Load and save state
            const appJsPath = path.join(__dirname, 'app.js');
            if (fs.existsSync(appJsPath)) {
                // Mock globals to extract state
                global.window = { location: { hash: '' }, addEventListener: () => {} };
                global.document = { addEventListener: () => {}, querySelectorAll: () => [], getElementById: () => null };
                global.localStorage = { getItem: () => null, setItem: () => {} };
                global.window.BrenerApp = {};
                
                const appJsCode = fs.readFileSync(appJsPath, 'utf8');
                const sanitizedCode = appJsCode
                    .replace("document.addEventListener('DOMContentLoaded'", "function initApp()")
                    .replace("window.BrenerApp.init();\\n});", "window.BrenerApp.init();\\n}");
                
                eval(sanitizedCode);
                window.BrenerApp.init();
                
                // Force seed all missing states into database state_data
                window.BrenerApp.initHakedisState();
                if (!window.BrenerApp.state.tasks) {
                    window.BrenerApp.state.tasks = [
                        { id: 'TSK-001', title: 'Haftalık şantiye raporlarını gözden geçir.', category: 'Şantiye', priority: 'Yüksek', completed: false, date: '2026-07-10' },
                        { id: 'TSK-002', title: 'Taşeron hakediş onaylarını tamamla.', category: 'Finans', priority: 'Yüksek', completed: true, date: '2026-07-05' },
                        { id: 'TSK-003', title: 'Bodrum belediye ruhsat yazısını takip et.', category: 'Ruhsat', priority: 'Orta', completed: false, date: '2026-07-12' },
                        { id: 'TSK-004', title: 'Mimari detay çizim revizyonlarını kontrol et.', category: 'Tasarım', priority: 'Düşük', completed: false, date: '2026-07-15' }
                    ];
                }
                if (!window.BrenerApp.state.crmLeads) {
                    window.BrenerApp.state.crmLeads = [
                        { id: 'lead_1', firstName: 'Mustafa', lastName: 'Kaya', phone: '05329998877', email: 'mustafa@kaya.com', type: 'Daire Satışı', stage: 'Yeni Giriş', details: 'A Blok 4 No\'lu daire ile ilgileniyor.' }
                    ];
                }
                if (!window.BrenerApp.state.budgetTransactions) {
                    window.BrenerApp.state.budgetTransactions = [];
                }
                if (!window.BrenerApp.state.claims) {
                    window.BrenerApp.state.claims = [
                        { id: 1001, subcontractor: "Kuzey Kalıp Ltd. Şti.", description: "Kaba inşaat işçilik hakedişi", totalAmount: 75000, retention: 3750, netPaid: 86250, date: "2026-06-25", status: "paid" }
                    ];
                }
                if (!window.BrenerApp.state.rolePermissions || Object.keys(window.BrenerApp.state.rolePermissions).length === 0) {
                    window.BrenerApp.state.rolePermissions = {
                        sefi: { genel: true, santiye: true, seflik: true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                        muhasebe: { genel: true, santiye: false, seflik: false, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                        saha: { genel: true, santiye: false, seflik: false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
                    };
                }
                
                if (!window.BrenerApp.state.notifications) {
                    window.BrenerApp.state.notifications = [];
                }
                if (!window.BrenerApp.state.reminders) {
                    window.BrenerApp.state.reminders = [];
                }
                if (!window.BrenerApp.state.customerPresentations) {
                    window.BrenerApp.state.customerPresentations = [];
                }
                
                const state = window.BrenerApp.state;
                state.currentUser = null;
                state.currentProjectId = null;
                
                await connection.query(
                    "INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)",
                    [companyId, JSON.stringify(state)]
                );
                console.log("Default company state seeded successfully.");
            }
        }
    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        if (connection) connection.release();
    }
}

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'brenergroupsecretjwtkey123!';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// ----------------- AUTHENTICATION API -----------------

// Register Company & Admin User
app.post('/api/auth/register', async (req, res) => {
    const { companyName, userName, email, password } = req.body;
    if (!companyName || !userName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // 1. Create Company
        const [compResult] = await connection.query(
            'INSERT INTO companies (name) VALUES (?)',
            [companyName]
        );
        const companyId = compResult.insertId;
        
        // 2. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        await connection.query(
            'INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [companyId, userName, email, passwordHash, 'admin']
        );
        
        // 3. Initialize empty state JSON for company
        const emptyState = {
            projects: [],
            reminders: [],
            timesheet: {},
            employees: [],
            materials: [],
            hseIncidents: [],
            concretePours: [],
            claims: [],
            workOrders: [],
            customers: [],
            logs: [],
            projectContracts: {},
            projectSpecs: {},
            specTemplates: [],
            customerPresentations: [],
            defectDeductions: [],
            hakedisContractItems: [],
            hakedisContracts: [],
            otherDeductionEntries: [],
            paymentApprovals: [],
            periodItemEntries: [],
            progressPayments: [],
            siteRecords: [],
            budgetTransactions: [],
            crmLeads: [],
            tasks: [],
            requests: [],
            rolePermissions: {
                sefi: { genel: true, santiye: true, seflik: true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                muhasebe: { genel: true, santiye: false, seflik: false, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                saha: { genel: true, santiye: false, seflik: false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
            },
            theme: 'dark'
        };
        
        await connection.query(
            'INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)',
            [companyId, JSON.stringify(emptyState)]
        );
        
        await connection.commit();
        res.status(201).json({ message: 'Company and admin user successfully registered!' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Registration error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email address already registered' });
        }
        res.status(500).json({ error: 'Internal server error during registration' });
    } finally {
        if (connection) connection.release();
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const [rows] = await pool.query(
            'SELECT u.*, c.name AS company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, company_id: user.company_id, name: user.name, role: user.role, company_name: user.company_name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_name: user.company_name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ----------------- MULTI-TENANT STATE SYNC API -----------------

// Fetch State JSON for Company
app.get('/api/state', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT state_data FROM tenant_data WHERE company_id = ?',
            [req.user.company_id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tenant data not found' });
        }
        
        res.json(JSON.parse(rows[0].state_data));
    } catch (err) {
        console.error('Fetch state error:', err);
        res.status(500).json({ error: 'Failed to retrieve application state' });
    }
});

// Save State JSON for Company
app.post('/api/state', authenticateToken, async (req, res) => {
    try {
        const stateDataStr = JSON.stringify(req.body);
        
        await pool.query(
            'INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_data = ?',
            [req.user.company_id, stateDataStr, stateDataStr]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Save state error:', err);
        res.status(500).json({ error: 'Failed to save application state' });
    }
});

// ----------------- USER MANAGEMENT API -----------------

// Get Users List for Company
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE company_id = ?',
            [req.user.company_id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

// Add New User to Company
app.post('/api/users', authenticateToken, async (req, res) => {
    // Only admins can add users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can manage users' });
    }
    
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const [result] = await pool.query(
            'INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [req.user.company_id, name, email, passwordHash, role]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role
        });
    } catch (err) {
        console.error('Create user error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email address already registered' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete User from Company
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can manage users' });
    }
    
    const targetUserId = req.params.id;
    if (parseInt(targetUserId) === parseInt(req.user.id)) {
        return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    
    try {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ? AND company_id = ?',
            [targetUserId, req.user.company_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found or not in your company' });
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Change User Password / Profile
app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
    const targetUserId = req.params.id;
    const { newPassword } = req.body;
    
    // Users can only change their own password, unless they are admin
    if (parseInt(targetUserId) !== parseInt(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to change this password' });
    }
    
    if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        const [result] = await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ? AND company_id = ?',
            [passwordHash, targetUserId, req.user.company_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, message: 'Password successfully updated' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
});


// Environment Diagnostics Endpoint
app.get('/api/test-env', (req, res) => {
    res.json({
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasTwilioFrom: !!process.env.TWILIO_WHATSAPP_FROM,
        twilioFromValue: process.env.TWILIO_WHATSAPP_FROM || null,
        openaiKeyFirstChars: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : null
    });
});

// Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
    const status = {
        time: new Date().toISOString(),
        database: 'Checking...',
        userCount: 0,
        companyCount: 0,
        stateKeys: [],
        envKeys: Object.keys(process.env).filter(k => k.startsWith('DB_') || k === 'JWT_SECRET' || k === 'PORT')
    };
    
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        status.database = 'Connected successfully!';
        status.userCount = rows[0].count;
        
        const [compRows] = await pool.query('SELECT COUNT(*) as count FROM companies');
        status.companyCount = compRows[0].count;
        
        const [stateRows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (stateRows.length > 0) {
            try {
                const state = JSON.parse(stateRows[0].state_data);
                status.stateKeys = Object.keys(state);
            } catch(e) {
                status.stateKeys = 'JSON Parse Error: ' + e.message;
            }
        } else {
            status.stateKeys = 'No state found for company 1';
        }
        
        res.json(status);
    } catch (err) {
        status.database = 'Error: ' + err.message;
        status.errorDetails = err;
        res.status(500).json(status);
    }
});

// In-memory simple session store for WhatsApp/Telegram chat flows
const chatSessions = new Map();

// Helper function to download an image from a URL and convert it to base64 for multimodal LLM processing
async function downloadMediaAsBase64(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return {
            base64,
            mimeType: response.headers['content-type'] || 'image/jpeg'
        };
    } catch (err) {
        console.error('❌ Medya indirme hatası:', err.message);
        return null;
    }
}

// Helper function to call the AI model (Gemini or OpenAI) depending on what API key is configured
async function callAIModel(prompt, base64ImageObj) {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (geminiKey) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
            const contents = [];
            const parts = [{ text: prompt }];
            
            if (base64ImageObj) {
                parts.push({
                    inlineData: {
                        mimeType: base64ImageObj.mimeType,
                        data: base64ImageObj.base64
                    }
                });
            }
            contents.push({ parts });
            
            const response = await axios.post(url, { contents }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (err) {
            console.error('❌ Gemini API hatası:', err.response?.data || err.message);
            return '';
        }
    } else if (openaiKey) {
        try {
            const url = 'https://api.openai.com/v1/chat/completions';
            const messages = [];
            const contentParts = [{ type: 'text', text: prompt }];
            
            if (base64ImageObj) {
                contentParts.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:${base64ImageObj.mimeType};base64,${base64ImageObj.base64}`
                    }
                });
            }
            messages.push({ role: 'user', content: contentParts });
            
            const response = await axios.post(url, {
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data?.choices?.[0]?.message?.content || '';
        } catch (err) {
            console.error('❌ OpenAI API hatası:', err.response?.data || err.message);
            return '';
        }
    } else {
        console.warn('⚠️ Herhangi bir GEMINI_API_KEY veya OPENAI_API_KEY tanımlanmamış. AI devre dışı.');
        return '';
    }
}

/**
 * POST /webhook/whatsapp
 * Twilio calls this URL when a WhatsApp message arrives.
 */
app.post('/webhook/whatsapp', express.urlencoded({ extended: false }), async (req, res) => {
    const from     = req.body.From  || '';   // e.g. whatsapp:+905327398489
    const body     = req.body.Body  || '';
    const numMedia = parseInt(req.body.NumMedia || '0', 10);
    const mediaUrl = numMedia > 0 ? req.body.MediaUrl0  : null;
    const now    = new Date().toISOString().split('T')[0];

    console.log(`\n📲 WA Mesaj Alındı | Gönderen: ${from} | Medya: ${numMedia > 0 ? 'VAR' : 'YOK'} | İçerik: ${body.substring(0,60)}`);

    let response = '';
    
    try {
        const [stateRows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (stateRows.length === 0) {
            throw new Error('Tenant data not found');
        }
        
        const state = JSON.parse(stateRows[0].state_data);
        const projects = state.projects || [];
        const activeProj = projects.find(p => p.id === (state.currentProjectId || (projects[0] && projects[0].id)));
        
        // --- 1. OTURUM DURUMU KONTROLÜ (ÇOK TURLU SOHBET) ---
        if (chatSessions.has(from) && chatSessions.get(from).status === 'AWAITING_PROJECT') {
            const session = chatSessions.get(from);
            const choice = body.trim();
            const num = parseInt(choice, 10);
            let selectedProject = null;

            if (!isNaN(num) && num > 0 && num <= projects.length) {
                selectedProject = projects[num - 1];
            } else {
                selectedProject = projects.find(p => p.name.toLowerCase().includes(choice.toLowerCase()));
            }

            if (selectedProject) {
                // Faturayı seçilen projeye işle
                const claim = session.draft;
                claim.project = selectedProject.name;
                
                if (!state.claims) state.claims = [];
                state.claims.unshift(claim);

                // Proje harcamasını güncelle
                selectedProject.spent = (selectedProject.spent || 0) + claim.totalAmount;

                // Aktivite günlüğü
                if (!state.activityLog) state.activityLog = [];
                state.activityLog.unshift({
                    id: Date.now(),
                    module: 'whatsapp',
                    message: `Fatura Atandı: ${selectedProject.name}`,
                    type: 'success',
                    detail: `${claim.subcontractor} — ${claim.totalAmount} ₺`,
                    timestamp: new Date().toISOString()
                });

                // Veritabanını güncelle
                await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                
                chatSessions.delete(from); // Oturumu temizle
                response = `✅ *Fatura Başarıyla Atandı!*\n\n🏗️ Proje: *${selectedProject.name}*\n🏢 Tedarikçi: ${claim.subcontractor}\n💰 Tutar: ${claim.totalAmount.toLocaleString('tr-TR')} ₺\n\nFinans modülüne işlendi.`;
            } else {
                const projList = projects.map((p, idx) => `*${idx + 1}-* ${p.name}`).join('\n');
                response = `⚠️ Eşleşen proje bulunamadı. Lütfen listedeki projenin numarasını veya adını tam olarak yazın:\n\n${projList}`;
            }

        } else {
            // --- 2. AI APİ KONTROLÜ VE YENİ GİRDİ İŞLEME ---
            const geminiKey = process.env.GEMINI_API_KEY || '';
            const openaiKey = process.env.OPENAI_API_KEY || '';

            if (geminiKey || openaiKey) {
                let base64Image = null;
                if (mediaUrl) {
                    base64Image = await downloadMediaAsBase64(mediaUrl);
                }

                const systemPrompt = `
                Sen Brener Group İnşaat Yönetim Platformu'nun saha yapay zeka asistanısın.
                Sana sahada çalışan bir personelin gönderdiği bir mesaj ve/veya fotoğraf iletilecek. 
                Bu girdi bir fatura/fiş görseli, şantiye ilerleme fotoğrafı, malzeme talep yazısı veya sadece sohbet olabilir.

                Analiz et ve sadece aşağıdaki şablona uygun bir JSON döndür. Başka hiçbir şey yazma (markdown \`\`\`json blokları olmasın, ham metin olarak JSON döndür):

                {
                  "type": "fatura" | "ilerleme" | "talep" | "sohbet",
                  "confidence": 95,
                  "data": {
                    "tedarikci": "Faturayı kesen firma/şahıs ismi (yoksa 'Bilinmeyen')",
                    "toplamTutar": 45000, // Sayı olarak toplam fatura tutarı
                    "kdv": 7500, // Sayı olarak KDV tutarı
                    "malzeme": "Beton, Baret, Tuğla vb. ne alındıysa",
                    "miktar": "Miktar (örn: 50 m3, 10 adet)",
                    "tarih": "${now}", // YYYY-MM-DD formatında fatura tarihi
                    "asama": "Demir Donatı & Kalıp İşleri, Tuğla Örme, Alçı Sıva vb.",
                    "detay": "İlerlemenin kısa teknik özeti",
                    "ilerlemeDelta": 5, // Fiziki yüzde katkısı (1-10 arası sayı)
                    "malzemeler": ["20 adet İSG Bareti", "10 çift çizme"],
                    "reply": "Kullanıcıya verilecek kibar inşaatçı üsluplu Türkçe yanıt"
                  }
                }
                `;

                const aiOutput = await callAIModel(systemPrompt + `\nKullanıcı mesajı: "${body}"`, base64Image);
                let aiResult = null;

                try {
                    // Temiz JSON bulmak için Regex uygulayalım (markdown bloklarını temizle)
                    const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        aiResult = JSON.parse(jsonMatch[0]);
                    }
                } catch (parseErr) {
                    console.error('❌ AI JSON parse hatası:', parseErr.message, '\nAI Çıktısı:', aiOutput);
                }

                if (aiResult) {
                    const docType = aiResult.type;
                    const data = aiResult.data;

                    if (docType === 'sohbet') {
                        response = data.reply || 'Anlaşıldı, şantiyeden yeni veri akışı bekliyorum.';
                    } 
                    else if (docType === 'ilerleme') {
                        if (activeProj) {
                            activeProj.progress = Math.min(100, (activeProj.progress || 0) + (data.ilerlemeDelta || 5));
                        }
                        const newActivity = {
                            id: Date.now(),
                            module: 'whatsapp',
                            message: `AI İlerleme: ${data.asama || 'Genel Şantiye İlerlemesi'} (+%${data.ilerlemeDelta || 5})`,
                            type: 'success',
                            detail: data.detay || body,
                            timestamp: new Date().toISOString()
                        };
                        if (!state.activityLog) state.activityLog = [];
                        state.activityLog.unshift(newActivity);
                        
                        await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                        response = `✅ *Şantiye İlerlemesi Güncellendi!*\n\n🏗️ Proje: *${activeProj ? activeProj.name : 'Aktif Proje'}*\n📈 Durum: *${data.asama || 'İlerleme'}*\n📈 Katkı: +%${data.ilerlemeDelta || 5}\n📝 Tespit: ${data.detay || 'İlerleme fotoğrafı kaydedildi.'}`;
                    } 
                    else if (docType === 'talep') {
                        const reqList = state.requests || [];
                        const newId = `WA-TAL-${(reqList.length + 1).toString().padStart(3,'0')}`;
                        const materialsText = Array.isArray(data.malzemeler) ? data.malzemeler.join(', ') : (body || 'Saha Malzemeleri');
                        
                        const newReq = {
                            id: newId,
                            title: materialsText,
                            category: 'Malzeme',
                            priority: 'Yüksek',
                            date: now,
                            status: 'pending',
                            description: data.not || `WhatsApp AI ile el yazısı/sesli talep okundu.`,
                            requester: from.replace('whatsapp:', ''),
                            source: 'whatsapp'
                        };
                        reqList.unshift(newReq);
                        state.requests = reqList;

                        if (!state.activityLog) state.activityLog = [];
                        state.activityLog.unshift({
                            id: Date.now(),
                            module: 'whatsapp',
                            message: `AI Malzeme Talebi: ${newId}`,
                            type: 'info',
                            detail: materialsText,
                            timestamp: new Date().toISOString()
                        });

                        await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                        response = `✅ *Malzeme Talebi Oluşturuldu!*\n\n📋 Talep No: *${newId}*\n📦 Talep Listesi:\n${Array.isArray(data.malzemeler) ? data.malzemeler.map(m => `  • ${m}`).join('\n') : `  • ${materialsText}`}\n\nTalepler modülüne eklendi, onay bekliyor.`;
                    } 
                    else if (docType === 'fatura') {
                        const claim = {
                            id: Date.now(),
                            subcontractor: data.tedarikci || 'Bilinmeyen Tedarikçi',
                            description: `${data.malzeme || 'Malzeme Alımı'} (${data.miktar || 'Görsel'}) - AI OCR`,
                            totalAmount: data.toplamTutar || 45000,
                            retention: 0,
                            netPaid: data.toplamTutar || 45000,
                            date: data.tarih || now,
                            status: 'paid',
                            source: 'whatsapp'
                        };

                        if (projects.length > 1) {
                            // Birden fazla proje varsa oturum açıp sor
                            chatSessions.set(from, {
                                status: 'AWAITING_PROJECT',
                                draft: claim
                            });

                            const projList = projects.map((p, idx) => `*${idx + 1}-* ${p.name}`).join('\n');
                            response = `🧾 *Fatura Tespit Edildi (AI OCR)*\n\n🏢 Tedarikçi: *${claim.subcontractor}*\n💰 Toplam Tutar: *${claim.totalAmount.toLocaleString('tr-TR')} ₺*\n📦 Malzeme: ${data.malzeme || 'Belirtilmedi'}\n\n⚠️ Sistemde birden fazla aktif proje bulunmaktadır. Lütfen bu faturayı hangi projeye atayacağımı seçin (Numara veya İsim yazabilirsiniz):\n\n${projList}`;
                        } else {
                            // 1 veya 0 proje varsa doğrudan ata
                            const targetProj = projects[0];
                            if (targetProj) {
                                claim.project = targetProj.name;
                                targetProj.spent = (targetProj.spent || 0) + claim.totalAmount;
                            }
                            if (!state.claims) state.claims = [];
                            state.claims.unshift(claim);

                            if (!state.activityLog) state.activityLog = [];
                            state.activityLog.unshift({
                                id: Date.now(),
                                module: 'whatsapp',
                                message: `AI Fatura Girişi: ${claim.subcontractor}`,
                                type: 'success',
                                detail: `${claim.totalAmount} ₺`,
                                timestamp: new Date().toISOString()
                            });

                            await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                            response = `✅ *Fatura Kaydedildi!*\n\n🏢 Tedarikçi: *${claim.subcontractor}*\n💰 Tutar: *${claim.totalAmount.toLocaleString('tr-TR')} ₺*\n📦 Malzeme: ${data.malzeme || 'Belirtilmedi'}\n🏗️ Proje: *${targetProj ? targetProj.name : 'Genel Gider'}*\n\nFinans modülüne işlendi.`;
                        }
                    }
                }
            }

            // Fallback (Yapay zeka anahtarı girilmemişse veya yanıt alınamadıysa)
            if (!response) {
                const lowerBody = body.toLowerCase();
                if (numMedia > 0 || lowerBody.includes('fatura') || lowerBody.includes('fiş') || lowerBody.includes('ilerleme') || lowerBody.includes('talep')) {
                    // Eski statik/regex kuralları çalıştır
                    let docType = 'fatura';
                    if (lowerBody.includes('ilerleme') || numMedia > 0 && !lowerBody.includes('fatura')) docType = 'ilerleme';
                    else if (lowerBody.includes('talep')) docType = 'talep';

                    if (docType === 'fatura') {
                        const newClaim = { id: Date.now(), subcontractor: 'WA Fatura (OCR)', description: `WhatsApp Girdisi: ${body || 'Görsel'}`, totalAmount: 45000, retention: 0, netPaid: 45000, date: now, status: 'paid', source: 'whatsapp' };
                        if (!state.claims) state.claims = [];
                        state.claims.unshift(newClaim);
                        response = `✅ *Fatura Kaydedildi (Statik Fallback)!*\n\n🏢 Tedarikçi: Yavuz Beton A.Ş.\n💰 Tutar: 45.000 ₺\n\n(AI API Anahtarı girilmediği için şablon veri uygulandı.)`;
                    } else if (docType === 'ilerleme') {
                        if (activeProj) activeProj.progress = Math.min(100, (activeProj.progress || 0) + 5);
                        response = `✅ *Şantiye İlerlemesi Kaydedildi (Statik Fallback)!*\n\n🏗️ Proje: ${activeProj ? activeProj.name : 'Aktif Proje'}\n📈 İlerleme: +%5 artırıldı.`;
                    } else {
                        const reqList = state.requests || [];
                        const newId = `WA-TAL-${(reqList.length + 1).toString().padStart(3,'0')}`;
                        reqList.unshift({ id: newId, title: body || 'Saha Talebi', category: 'Malzeme', priority: 'Yüksek', date: now, status: 'pending', description: 'WhatsApp Fallback Girişi', requester: from.replace('whatsapp:', ''), source: 'whatsapp' });
                        state.requests = reqList;
                        response = `✅ *Malzeme Talebi Oluşturuldu (Statik Fallback)!*\n\n📋 Talep No: ${newId}\n📝 İçerik: ${body}`;
                    }

                    if (!state.activityLog) state.activityLog = [];
                    state.activityLog.unshift({ id: Date.now(), module: 'whatsapp', message: `Fallback Girişi (${docType})`, type: 'success', detail: body.substring(0, 100), timestamp: new Date().toISOString() });
                    await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                } else {
                    response = '📲 *Brener Group Yapay Zeka Saha Asistanı*\n\nSistemimize hoş geldiniz. Otomatik işlem için WhatsApp üzerinden:\n- Fatura veya Fiş görseli gönderin\n- Şantiye ilerleme görseli gönderin\n- El yazısı malzeme talep listesi gönderin\n\nAI Vision motorumuz verileri otomatik ayrıştıracaktır.';
                }
            }
        }
    } catch (dbErr) {
        console.error('❌ DB Hatası:', dbErr.message);
        response = '⚠️ Sistem hatası oluştu. Lütfen tekrar deneyin.';
    }

    // --- Twilio üzerinden WhatsApp yanıtı gönder ---
    if (response) {
        try {
            const client = getTwilioClient();
            if (client) {
                await client.messages.create({
                    from: process.env.TWILIO_WHATSAPP_FROM,
                    to: from,
                    body: response
                });
                console.log(`   ✅ WA Yanıt gönderildi → ${from}`);
            }
        } catch (twilioErr) {
            console.error('   ❌ WA Yanıt hatası:', twilioErr.message);
        }
    }

    // Twilio'ya 200 OK döndür
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
});

/**
 * GET /api/whatsapp/log
 * Son WhatsApp mesaj işlemlerini döndür (frontend için polling endpoint)
 */
app.get('/api/whatsapp/log', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (rows.length > 0) {
            const state = JSON.parse(rows[0].state_data);
            const log = (state.activityLog || []).filter(e => e.module === 'whatsapp').slice(0, 20);
            res.json({ success: true, log });
        } else {
            res.json({ success: true, log: [] });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/whatsapp/send
 * Manuel mesaj gönderme (test için)
 */
app.post('/api/whatsapp/send', express.json(), async (req, res) => {
    const { to, message } = req.body;
    try {
        const client = getTwilioClient();
        if (!client) return res.status(503).json({ success: false, error: 'Twilio yapılandırılmamış. .env dosyasındaki TWILIO_AUTH_TOKEN değerini kontrol edin.' });
        const msg = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to:   `whatsapp:${to}`,
            body: message
        });
        res.json({ success: true, sid: msg.sid });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Fallback to serve index.html for SPA router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Brener Group backend running on http://localhost:${PORT}`);
    });
});
=======
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const pool = require('./database');

// Load env variables
require('dotenv').config();

// Twilio Client (loaded lazily so server starts even without credentials)
let twilioClient = null;
function getTwilioClient() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'BURAYA_AUTH_TOKEN_YAZIN') {
        try {
            twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            console.log('✅ Twilio client initialized.');
        } catch(e) {
            console.warn('⚠️  Twilio package not found. Run: npm install twilio');
        }
    }
    return twilioClient;
}
// Automatic database tables initialization and seeding check
async function initializeDatabase() {
    console.log("Checking database tables...");
    let connection;
    try {
        connection = await pool.getConnection();
        
        // 1. Create tables if they don't exist by executing schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (let statement of statements) {
                await connection.query(statement);
            }
            console.log("Database tables verified/created.");
        }
        // Delete all users except Emre on server startup to clean test accounts
        await connection.query("DELETE FROM users WHERE email != 'emre@brener.com.tr'");
        
        // 2. Check if users is empty (or has only Emre left, which is fine)
        const [userRows] = await connection.query("SELECT COUNT(*) as count FROM users");
        if (userRows[0].count === 0) {
            // Check if Brener Group company exists, else create it
            const [compRows] = await connection.query("SELECT id FROM companies WHERE name = 'Brener Group'");
            let companyId;
            if (compRows.length > 0) {
                companyId = compRows[0].id;
            } else {
                const [compResult] = await connection.query("INSERT INTO companies (name) VALUES ('Brener Group')");
                companyId = compResult.insertId;
            }
            console.log("Database is empty. Running automatic seed...");
            
            // Create default users (only Emre remains)
            const defaultUsers = [
                { name: 'Emre Türedi', email: 'emre@brener.com.tr', password: 'Emre3wr3', role: 'admin' }
            ];
            
            for (let user of defaultUsers) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(user.password, salt);
                await connection.query(
                    "INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                    [companyId, user.name, user.email, passwordHash, user.role]
                );
            }
            console.log("Default users created.");
            
            // Load and save state
            const appJsPath = path.join(__dirname, 'app.js');
            if (fs.existsSync(appJsPath)) {
                // Mock globals to extract state
                global.window = { location: { hash: '' }, addEventListener: () => {} };
                global.document = { addEventListener: () => {}, querySelectorAll: () => [], getElementById: () => null };
                global.localStorage = { getItem: () => null, setItem: () => {} };
                global.window.BrenerApp = {};
                
                const appJsCode = fs.readFileSync(appJsPath, 'utf8');
                const sanitizedCode = appJsCode
                    .replace("document.addEventListener('DOMContentLoaded'", "function initApp()")
                    .replace("window.BrenerApp.init();\\n});", "window.BrenerApp.init();\\n}");
                
                eval(sanitizedCode);
                window.BrenerApp.init();
                
                // Force seed all missing states into database state_data
                window.BrenerApp.initHakedisState();
                if (!window.BrenerApp.state.tasks) {
                    window.BrenerApp.state.tasks = [
                        { id: 'TSK-001', title: 'Haftalık şantiye raporlarını gözden geçir.', category: 'Şantiye', priority: 'Yüksek', completed: false, date: '2026-07-10' },
                        { id: 'TSK-002', title: 'Taşeron hakediş onaylarını tamamla.', category: 'Finans', priority: 'Yüksek', completed: true, date: '2026-07-05' },
                        { id: 'TSK-003', title: 'Bodrum belediye ruhsat yazısını takip et.', category: 'Ruhsat', priority: 'Orta', completed: false, date: '2026-07-12' },
                        { id: 'TSK-004', title: 'Mimari detay çizim revizyonlarını kontrol et.', category: 'Tasarım', priority: 'Düşük', completed: false, date: '2026-07-15' }
                    ];
                }
                if (!window.BrenerApp.state.crmLeads) {
                    window.BrenerApp.state.crmLeads = [
                        { id: 'lead_1', firstName: 'Mustafa', lastName: 'Kaya', phone: '05329998877', email: 'mustafa@kaya.com', type: 'Daire Satışı', stage: 'Yeni Giriş', details: 'A Blok 4 No\'lu daire ile ilgileniyor.' }
                    ];
                }
                if (!window.BrenerApp.state.budgetTransactions) {
                    window.BrenerApp.state.budgetTransactions = [];
                }
                if (!window.BrenerApp.state.claims) {
                    window.BrenerApp.state.claims = [
                        { id: 1001, subcontractor: "Kuzey Kalıp Ltd. Şti.", description: "Kaba inşaat işçilik hakedişi", totalAmount: 75000, retention: 3750, netPaid: 86250, date: "2026-06-25", status: "paid" }
                    ];
                }
                if (!window.BrenerApp.state.rolePermissions || Object.keys(window.BrenerApp.state.rolePermissions).length === 0) {
                    window.BrenerApp.state.rolePermissions = {
                        sefi: { genel: true, santiye: true, seflik: true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                        muhasebe: { genel: true, santiye: false, seflik: false, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                        saha: { genel: true, santiye: false, seflik: false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
                    };
                }
                
                if (!window.BrenerApp.state.notifications) {
                    window.BrenerApp.state.notifications = [];
                }
                if (!window.BrenerApp.state.reminders) {
                    window.BrenerApp.state.reminders = [];
                }
                if (!window.BrenerApp.state.customerPresentations) {
                    window.BrenerApp.state.customerPresentations = [];
                }
                
                const state = window.BrenerApp.state;
                state.currentUser = null;
                state.currentProjectId = null;
                
                await connection.query(
                    "INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)",
                    [companyId, JSON.stringify(state)]
                );
                console.log("Default company state seeded successfully.");
            }
        }
    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        if (connection) connection.release();
    }
}

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'brenergroupsecretjwtkey123!';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// ----------------- AUTHENTICATION API -----------------

// Register Company & Admin User
app.post('/api/auth/register', async (req, res) => {
    const { companyName, userName, email, password } = req.body;
    if (!companyName || !userName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // 1. Create Company
        const [compResult] = await connection.query(
            'INSERT INTO companies (name) VALUES (?)',
            [companyName]
        );
        const companyId = compResult.insertId;
        
        // 2. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        await connection.query(
            'INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [companyId, userName, email, passwordHash, 'admin']
        );
        
        // 3. Initialize empty state JSON for company
        const emptyState = {
            projects: [],
            reminders: [],
            timesheet: {},
            employees: [],
            materials: [],
            hseIncidents: [],
            concretePours: [],
            claims: [],
            workOrders: [],
            customers: [],
            logs: [],
            projectContracts: {},
            projectSpecs: {},
            specTemplates: [],
            customerPresentations: [],
            defectDeductions: [],
            hakedisContractItems: [],
            hakedisContracts: [],
            otherDeductionEntries: [],
            paymentApprovals: [],
            periodItemEntries: [],
            progressPayments: [],
            siteRecords: [],
            budgetTransactions: [],
            crmLeads: [],
            tasks: [],
            requests: [],
            rolePermissions: {
                sefi: { genel: true, santiye: true, seflik: true, finans: false, hesaplama: true, degerleme: false, ai: true, saha: false, ekip: true, belgeler: true },
                muhasebe: { genel: true, santiye: false, seflik: false, finans: true, hesaplama: false, degerleme: true, ai: false, saha: false, ekip: false, belgeler: true },
                saha: { genel: true, santiye: false, seflik: false, finans: false, hesaplama: false, degerleme: false, ai: false, saha: true, ekip: true, belgeler: true }
            },
            theme: 'dark'
        };
        
        await connection.query(
            'INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)',
            [companyId, JSON.stringify(emptyState)]
        );
        
        await connection.commit();
        res.status(201).json({ message: 'Company and admin user successfully registered!' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Registration error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email address already registered' });
        }
        res.status(500).json({ error: 'Internal server error during registration' });
    } finally {
        if (connection) connection.release();
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const [rows] = await pool.query(
            'SELECT u.*, c.name AS company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, company_id: user.company_id, name: user.name, role: user.role, company_name: user.company_name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_name: user.company_name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ----------------- MULTI-TENANT STATE SYNC API -----------------

// Fetch State JSON for Company
app.get('/api/state', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT state_data FROM tenant_data WHERE company_id = ?',
            [req.user.company_id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tenant data not found' });
        }
        
        res.json(JSON.parse(rows[0].state_data));
    } catch (err) {
        console.error('Fetch state error:', err);
        res.status(500).json({ error: 'Failed to retrieve application state' });
    }
});

// Save State JSON for Company
app.post('/api/state', authenticateToken, async (req, res) => {
    try {
        const stateDataStr = JSON.stringify(req.body);
        
        await pool.query(
            'INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_data = ?',
            [req.user.company_id, stateDataStr, stateDataStr]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Save state error:', err);
        res.status(500).json({ error: 'Failed to save application state' });
    }
});

// ----------------- USER MANAGEMENT API -----------------

// Get Users List for Company
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE company_id = ?',
            [req.user.company_id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

// Add New User to Company
app.post('/api/users', authenticateToken, async (req, res) => {
    // Only admins can add users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can manage users' });
    }
    
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const [result] = await pool.query(
            'INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [req.user.company_id, name, email, passwordHash, role]
        );
        
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role
        });
    } catch (err) {
        console.error('Create user error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email address already registered' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete User from Company
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can manage users' });
    }
    
    const targetUserId = req.params.id;
    if (parseInt(targetUserId) === parseInt(req.user.id)) {
        return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    
    try {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ? AND company_id = ?',
            [targetUserId, req.user.company_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found or not in your company' });
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Change User Password / Profile
app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
    const targetUserId = req.params.id;
    const { newPassword } = req.body;
    
    // Users can only change their own password, unless they are admin
    if (parseInt(targetUserId) !== parseInt(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to change this password' });
    }
    
    if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        const [result] = await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ? AND company_id = ?',
            [passwordHash, targetUserId, req.user.company_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, message: 'Password successfully updated' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
});


// Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
    const status = {
        time: new Date().toISOString(),
        database: 'Checking...',
        userCount: 0,
        companyCount: 0,
        stateKeys: [],
        envKeys: Object.keys(process.env).filter(k => k.startsWith('DB_') || k === 'JWT_SECRET' || k === 'PORT')
    };
    
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        status.database = 'Connected successfully!';
        status.userCount = rows[0].count;
        
        const [compRows] = await pool.query('SELECT COUNT(*) as count FROM companies');
        status.companyCount = compRows[0].count;
        
        const [stateRows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (stateRows.length > 0) {
            try {
                const state = JSON.parse(stateRows[0].state_data);
                status.stateKeys = Object.keys(state);
            } catch(e) {
                status.stateKeys = 'JSON Parse Error: ' + e.message;
            }
        } else {
            status.stateKeys = 'No state found for company 1';
        }
        
        res.json(status);
    } catch (err) {
        status.database = 'Error: ' + err.message;
        status.errorDetails = err;
        res.status(500).json(status);
    }
});

// In-memory simple session store for WhatsApp/Telegram chat flows
const chatSessions = new Map();

// Helper function to download an image from a URL and convert it to base64 for multimodal LLM processing
async function downloadMediaAsBase64(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return {
            base64,
            mimeType: response.headers['content-type'] || 'image/jpeg'
        };
    } catch (err) {
        console.error('❌ Medya indirme hatası:', err.message);
        return null;
    }
}

// Helper function to call the AI model (Gemini or OpenAI) depending on what API key is configured
async function callAIModel(prompt, base64ImageObj) {
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (geminiKey) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
            const contents = [];
            const parts = [{ text: prompt }];
            
            if (base64ImageObj) {
                parts.push({
                    inlineData: {
                        mimeType: base64ImageObj.mimeType,
                        data: base64ImageObj.base64
                    }
                });
            }
            contents.push({ parts });
            
            const response = await axios.post(url, { contents }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (err) {
            console.error('❌ Gemini API hatası:', err.response?.data || err.message);
            return '';
        }
    } else if (openaiKey) {
        try {
            const url = 'https://api.openai.com/v1/chat/completions';
            const messages = [];
            const contentParts = [{ type: 'text', text: prompt }];
            
            if (base64ImageObj) {
                contentParts.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:${base64ImageObj.mimeType};base64,${base64ImageObj.base64}`
                    }
                });
            }
            messages.push({ role: 'user', content: contentParts });
            
            const response = await axios.post(url, {
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data?.choices?.[0]?.message?.content || '';
        } catch (err) {
            console.error('❌ OpenAI API hatası:', err.response?.data || err.message);
            return '';
        }
    } else {
        console.warn('⚠️ Herhangi bir GEMINI_API_KEY veya OPENAI_API_KEY tanımlanmamış. AI devre dışı.');
        return '';
    }
}

/**
 * POST /webhook/whatsapp
 * Twilio calls this URL when a WhatsApp message arrives.
 */
app.post('/webhook/whatsapp', express.urlencoded({ extended: false }), async (req, res) => {
    const from     = req.body.From  || '';   // e.g. whatsapp:+905327398489
    const body     = req.body.Body  || '';
    const numMedia = parseInt(req.body.NumMedia || '0', 10);
    const mediaUrl = numMedia > 0 ? req.body.MediaUrl0  : null;
    const now    = new Date().toISOString().split('T')[0];

    console.log(`\n📲 WA Mesaj Alındı | Gönderen: ${from} | Medya: ${numMedia > 0 ? 'VAR' : 'YOK'} | İçerik: ${body.substring(0,60)}`);

    let response = '';
    
    try {
        const [stateRows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (stateRows.length === 0) {
            throw new Error('Tenant data not found');
        }
        
        const state = JSON.parse(stateRows[0].state_data);
        const projects = state.projects || [];
        const activeProj = projects.find(p => p.id === (state.currentProjectId || (projects[0] && projects[0].id)));
        
        // --- 1. OTURUM DURUMU KONTROLÜ (ÇOK TURLU SOHBET) ---
        if (chatSessions.has(from) && chatSessions.get(from).status === 'AWAITING_PROJECT') {
            const session = chatSessions.get(from);
            const choice = body.trim();
            const num = parseInt(choice, 10);
            let selectedProject = null;

            if (!isNaN(num) && num > 0 && num <= projects.length) {
                selectedProject = projects[num - 1];
            } else {
                selectedProject = projects.find(p => p.name.toLowerCase().includes(choice.toLowerCase()));
            }

            if (selectedProject) {
                // Faturayı seçilen projeye işle
                const claim = session.draft;
                claim.project = selectedProject.name;
                
                if (!state.claims) state.claims = [];
                state.claims.unshift(claim);

                // Proje harcamasını güncelle
                selectedProject.spent = (selectedProject.spent || 0) + claim.totalAmount;

                // Aktivite günlüğü
                if (!state.activityLog) state.activityLog = [];
                state.activityLog.unshift({
                    id: Date.now(),
                    module: 'whatsapp',
                    message: `Fatura Atandı: ${selectedProject.name}`,
                    type: 'success',
                    detail: `${claim.subcontractor} — ${claim.totalAmount} ₺`,
                    timestamp: new Date().toISOString()
                });

                // Veritabanını güncelle
                await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                
                chatSessions.delete(from); // Oturumu temizle
                response = `✅ *Fatura Başarıyla Atandı!*\n\n🏗️ Proje: *${selectedProject.name}*\n🏢 Tedarikçi: ${claim.subcontractor}\n💰 Tutar: ${claim.totalAmount.toLocaleString('tr-TR')} ₺\n\nFinans modülüne işlendi.`;
            } else {
                const projList = projects.map((p, idx) => `*${idx + 1}-* ${p.name}`).join('\n');
                response = `⚠️ Eşleşen proje bulunamadı. Lütfen listedeki projenin numarasını veya adını tam olarak yazın:\n\n${projList}`;
            }

        } else {
            // --- 2. AI APİ KONTROLÜ VE YENİ GİRDİ İŞLEME ---
            const geminiKey = process.env.GEMINI_API_KEY || '';
            const openaiKey = process.env.OPENAI_API_KEY || '';

            if (geminiKey || openaiKey) {
                let base64Image = null;
                if (mediaUrl) {
                    base64Image = await downloadMediaAsBase64(mediaUrl);
                }

                const systemPrompt = `
                Sen Brener Group İnşaat Yönetim Platformu'nun saha yapay zeka asistanısın.
                Sana sahada çalışan bir personelin gönderdiği bir mesaj ve/veya fotoğraf iletilecek. 
                Bu girdi bir fatura/fiş görseli, şantiye ilerleme fotoğrafı, malzeme talep yazısı veya sadece sohbet olabilir.

                Analiz et ve sadece aşağıdaki şablona uygun bir JSON döndür. Başka hiçbir şey yazma (markdown \`\`\`json blokları olmasın, ham metin olarak JSON döndür):

                {
                  "type": "fatura" | "ilerleme" | "talep" | "sohbet",
                  "confidence": 95,
                  "data": {
                    "tedarikci": "Faturayı kesen firma/şahıs ismi (yoksa 'Bilinmeyen')",
                    "toplamTutar": 45000, // Sayı olarak toplam fatura tutarı
                    "kdv": 7500, // Sayı olarak KDV tutarı
                    "malzeme": "Beton, Baret, Tuğla vb. ne alındıysa",
                    "miktar": "Miktar (örn: 50 m3, 10 adet)",
                    "tarih": "${now}", // YYYY-MM-DD formatında fatura tarihi
                    "asama": "Demir Donatı & Kalıp İşleri, Tuğla Örme, Alçı Sıva vb.",
                    "detay": "İlerlemenin kısa teknik özeti",
                    "ilerlemeDelta": 5, // Fiziki yüzde katkısı (1-10 arası sayı)
                    "malzemeler": ["20 adet İSG Bareti", "10 çift çizme"],
                    "reply": "Kullanıcıya verilecek kibar inşaatçı üsluplu Türkçe yanıt"
                  }
                }
                `;

                const aiOutput = await callAIModel(systemPrompt + `\nKullanıcı mesajı: "${body}"`, base64Image);
                let aiResult = null;

                try {
                    // Temiz JSON bulmak için Regex uygulayalım (markdown bloklarını temizle)
                    const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        aiResult = JSON.parse(jsonMatch[0]);
                    }
                } catch (parseErr) {
                    console.error('❌ AI JSON parse hatası:', parseErr.message, '\nAI Çıktısı:', aiOutput);
                }

                if (aiResult) {
                    const docType = aiResult.type;
                    const data = aiResult.data;

                    if (docType === 'sohbet') {
                        response = data.reply || 'Anlaşıldı, şantiyeden yeni veri akışı bekliyorum.';
                    } 
                    else if (docType === 'ilerleme') {
                        if (activeProj) {
                            activeProj.progress = Math.min(100, (activeProj.progress || 0) + (data.ilerlemeDelta || 5));
                        }
                        const newActivity = {
                            id: Date.now(),
                            module: 'whatsapp',
                            message: `AI İlerleme: ${data.asama || 'Genel Şantiye İlerlemesi'} (+%${data.ilerlemeDelta || 5})`,
                            type: 'success',
                            detail: data.detay || body,
                            timestamp: new Date().toISOString()
                        };
                        if (!state.activityLog) state.activityLog = [];
                        state.activityLog.unshift(newActivity);
                        
                        await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                        response = `✅ *Şantiye İlerlemesi Güncellendi!*\n\n🏗️ Proje: *${activeProj ? activeProj.name : 'Aktif Proje'}*\n📈 Durum: *${data.asama || 'İlerleme'}*\n📈 Katkı: +%${data.ilerlemeDelta || 5}\n📝 Tespit: ${data.detay || 'İlerleme fotoğrafı kaydedildi.'}`;
                    } 
                    else if (docType === 'talep') {
                        const reqList = state.requests || [];
                        const newId = `WA-TAL-${(reqList.length + 1).toString().padStart(3,'0')}`;
                        const materialsText = Array.isArray(data.malzemeler) ? data.malzemeler.join(', ') : (body || 'Saha Malzemeleri');
                        
                        const newReq = {
                            id: newId,
                            title: materialsText,
                            category: 'Malzeme',
                            priority: 'Yüksek',
                            date: now,
                            status: 'pending',
                            description: data.not || `WhatsApp AI ile el yazısı/sesli talep okundu.`,
                            requester: from.replace('whatsapp:', ''),
                            source: 'whatsapp'
                        };
                        reqList.unshift(newReq);
                        state.requests = reqList;

                        if (!state.activityLog) state.activityLog = [];
                        state.activityLog.unshift({
                            id: Date.now(),
                            module: 'whatsapp',
                            message: `AI Malzeme Talebi: ${newId}`,
                            type: 'info',
                            detail: materialsText,
                            timestamp: new Date().toISOString()
                        });

                        await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                        response = `✅ *Malzeme Talebi Oluşturuldu!*\n\n📋 Talep No: *${newId}*\n📦 Talep Listesi:\n${Array.isArray(data.malzemeler) ? data.malzemeler.map(m => `  • ${m}`).join('\n') : `  • ${materialsText}`}\n\nTalepler modülüne eklendi, onay bekliyor.`;
                    } 
                    else if (docType === 'fatura') {
                        const claim = {
                            id: Date.now(),
                            subcontractor: data.tedarikci || 'Bilinmeyen Tedarikçi',
                            description: `${data.malzeme || 'Malzeme Alımı'} (${data.miktar || 'Görsel'}) - AI OCR`,
                            totalAmount: data.toplamTutar || 45000,
                            retention: 0,
                            netPaid: data.toplamTutar || 45000,
                            date: data.tarih || now,
                            status: 'paid',
                            source: 'whatsapp'
                        };

                        if (projects.length > 1) {
                            // Birden fazla proje varsa oturum açıp sor
                            chatSessions.set(from, {
                                status: 'AWAITING_PROJECT',
                                draft: claim
                            });

                            const projList = projects.map((p, idx) => `*${idx + 1}-* ${p.name}`).join('\n');
                            response = `🧾 *Fatura Tespit Edildi (AI OCR)*\n\n🏢 Tedarikçi: *${claim.subcontractor}*\n💰 Toplam Tutar: *${claim.totalAmount.toLocaleString('tr-TR')} ₺*\n📦 Malzeme: ${data.malzeme || 'Belirtilmedi'}\n\n⚠️ Sistemde birden fazla aktif proje bulunmaktadır. Lütfen bu faturayı hangi projeye atayacağımı seçin (Numara veya İsim yazabilirsiniz):\n\n${projList}`;
                        } else {
                            // 1 veya 0 proje varsa doğrudan ata
                            const targetProj = projects[0];
                            if (targetProj) {
                                claim.project = targetProj.name;
                                targetProj.spent = (targetProj.spent || 0) + claim.totalAmount;
                            }
                            if (!state.claims) state.claims = [];
                            state.claims.unshift(claim);

                            if (!state.activityLog) state.activityLog = [];
                            state.activityLog.unshift({
                                id: Date.now(),
                                module: 'whatsapp',
                                message: `AI Fatura Girişi: ${claim.subcontractor}`,
                                type: 'success',
                                detail: `${claim.totalAmount} ₺`,
                                timestamp: new Date().toISOString()
                            });

                            await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                            response = `✅ *Fatura Kaydedildi!*\n\n🏢 Tedarikçi: *${claim.subcontractor}*\n💰 Tutar: *${claim.totalAmount.toLocaleString('tr-TR')} ₺*\n📦 Malzeme: ${data.malzeme || 'Belirtilmedi'}\n🏗️ Proje: *${targetProj ? targetProj.name : 'Genel Gider'}*\n\nFinans modülüne işlendi.`;
                        }
                    }
                }
            }

            // Fallback (Yapay zeka anahtarı girilmemişse veya yanıt alınamadıysa)
            if (!response) {
                const lowerBody = body.toLowerCase();
                if (numMedia > 0 || lowerBody.includes('fatura') || lowerBody.includes('fiş') || lowerBody.includes('ilerleme') || lowerBody.includes('talep')) {
                    // Eski statik/regex kuralları çalıştır
                    let docType = 'fatura';
                    if (lowerBody.includes('ilerleme') || numMedia > 0 && !lowerBody.includes('fatura')) docType = 'ilerleme';
                    else if (lowerBody.includes('talep')) docType = 'talep';

                    if (docType === 'fatura') {
                        const newClaim = { id: Date.now(), subcontractor: 'WA Fatura (OCR)', description: `WhatsApp Girdisi: ${body || 'Görsel'}`, totalAmount: 45000, retention: 0, netPaid: 45000, date: now, status: 'paid', source: 'whatsapp' };
                        if (!state.claims) state.claims = [];
                        state.claims.unshift(newClaim);
                        response = `✅ *Fatura Kaydedildi (Statik Fallback)!*\n\n🏢 Tedarikçi: Yavuz Beton A.Ş.\n💰 Tutar: 45.000 ₺\n\n(AI API Anahtarı girilmediği için şablon veri uygulandı.)`;
                    } else if (docType === 'ilerleme') {
                        if (activeProj) activeProj.progress = Math.min(100, (activeProj.progress || 0) + 5);
                        response = `✅ *Şantiye İlerlemesi Kaydedildi (Statik Fallback)!*\n\n🏗️ Proje: ${activeProj ? activeProj.name : 'Aktif Proje'}\n📈 İlerleme: +%5 artırıldı.`;
                    } else {
                        const reqList = state.requests || [];
                        const newId = `WA-TAL-${(reqList.length + 1).toString().padStart(3,'0')}`;
                        reqList.unshift({ id: newId, title: body || 'Saha Talebi', category: 'Malzeme', priority: 'Yüksek', date: now, status: 'pending', description: 'WhatsApp Fallback Girişi', requester: from.replace('whatsapp:', ''), source: 'whatsapp' });
                        state.requests = reqList;
                        response = `✅ *Malzeme Talebi Oluşturuldu (Statik Fallback)!*\n\n📋 Talep No: ${newId}\n📝 İçerik: ${body}`;
                    }

                    if (!state.activityLog) state.activityLog = [];
                    state.activityLog.unshift({ id: Date.now(), module: 'whatsapp', message: `Fallback Girişi (${docType})`, type: 'success', detail: body.substring(0, 100), timestamp: new Date().toISOString() });
                    await pool.query('UPDATE tenant_data SET state_data = ? WHERE company_id = 1', [JSON.stringify(state)]);
                } else {
                    response = '📲 *Brener Group Yapay Zeka Saha Asistanı*\n\nSistemimize hoş geldiniz. Otomatik işlem için WhatsApp üzerinden:\n- Fatura veya Fiş görseli gönderin\n- Şantiye ilerleme görseli gönderin\n- El yazısı malzeme talep listesi gönderin\n\nAI Vision motorumuz verileri otomatik ayrıştıracaktır.';
                }
            }
        }
    } catch (dbErr) {
        console.error('❌ DB Hatası:', dbErr.message);
        response = '⚠️ Sistem hatası oluştu. Lütfen tekrar deneyin.';
    }

    // --- Twilio üzerinden WhatsApp yanıtı gönder ---
    if (response) {
        try {
            const client = getTwilioClient();
            if (client) {
                await client.messages.create({
                    from: process.env.TWILIO_WHATSAPP_FROM,
                    to: from,
                    body: response
                });
                console.log(`   ✅ WA Yanıt gönderildi → ${from}`);
            }
        } catch (twilioErr) {
            console.error('   ❌ WA Yanıt hatası:', twilioErr.message);
        }
    }

    // Twilio'ya 200 OK döndür
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
});

/**
 * GET /api/whatsapp/log
 * Son WhatsApp mesaj işlemlerini döndür (frontend için polling endpoint)
 */
app.get('/api/whatsapp/log', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT state_data FROM tenant_data WHERE company_id = 1');
        if (rows.length > 0) {
            const state = JSON.parse(rows[0].state_data);
            const log = (state.activityLog || []).filter(e => e.module === 'whatsapp').slice(0, 20);
            res.json({ success: true, log });
        } else {
            res.json({ success: true, log: [] });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/whatsapp/send
 * Manuel mesaj gönderme (test için)
 */
app.post('/api/whatsapp/send', express.json(), async (req, res) => {
    const { to, message } = req.body;
    try {
        const client = getTwilioClient();
        if (!client) return res.status(503).json({ success: false, error: 'Twilio yapılandırılmamış. .env dosyasındaki TWILIO_AUTH_TOKEN değerini kontrol edin.' });
        const msg = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to:   `whatsapp:${to}`,
            body: message
        });
        res.json({ success: true, sid: msg.sid });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Fallback to serve index.html for SPA router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Brener Group backend running on http://localhost:${PORT}`);
    });
});
>>>>>>> 9a1370ee15265c799f8908e37c943023ccf1c1a2
