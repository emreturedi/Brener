const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const pool = require('./database');
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

// Fallback to serve index.html for SPA router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Brener Group backend running on http://localhost:${PORT}`);
});
