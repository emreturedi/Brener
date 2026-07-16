const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFilePath = path.join(__dirname, 'local_db.json');

function loadLocalDb() {
    if (!fs.existsSync(dbFilePath)) {
        // Seed default local DB
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('Emre3wr3', salt);
        
        const defaultDb = {
            companies: [{ id: 1, name: "Brener Group" }],
            users: [
                { id: 1, company_id: 1, name: "Emre Türedi", email: "emre@brener.com.tr", password_hash: hash, role: "admin" }
            ],
            tenant_data: []
        };
        fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2), 'utf8');
        return defaultDb;
    }
    try {
        return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    } catch (e) {
        return { companies: [], users: [], tenant_data: [] };
    }
}

function saveLocalDb(db) {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf8');
}

async function executeQuery(sql, params = []) {
    const db = loadLocalDb();
    
    // Normalize spaces for easy matching
    const sqlClean = sql.replace(/\s+/g, ' ').trim();
    
    // 1. SELECT COUNT(*) as count FROM users
    if (/SELECT COUNT\(\*\)\s+as\s+count\s+FROM\s+users/i.test(sqlClean)) {
        return [[{ count: db.users.length }]];
    }
    
    // 2. SELECT COUNT(*) as count FROM companies
    if (/SELECT COUNT\(\*\)\s+as\s+count\s+FROM\s+companies/i.test(sqlClean)) {
        return [[{ count: db.companies.length }]];
    }
    
    // 3. SELECT state_data FROM tenant_data WHERE company_id = ?
    if (/SELECT\s+state_data\s+FROM\s+tenant_data\s+WHERE\s+company_id\s*=\s*\?/i.test(sqlClean)) {
        const companyId = Number(params[0]);
        const match = db.tenant_data.find(t => Number(t.company_id) === companyId);
        return match ? [[{ state_data: match.state_data }]] : [[]];
    }
    
    // 4. SELECT state_data FROM tenant_data WHERE company_id = 1
    if (/SELECT\s+state_data\s+FROM\s+tenant_data\s+WHERE\s+company_id\s*=\s*1/i.test(sqlClean)) {
        const match = db.tenant_data.find(t => Number(t.company_id) === 1);
        return match ? [[{ state_data: match.state_data }]] : [[]];
    }
    
    // 5. SELECT company_id FROM tenant_data WHERE company_id = ?
    if (/SELECT\s+company_id\s+FROM\s+tenant_data\s+WHERE\s+company_id\s*=\s*\?/i.test(sqlClean)) {
        const companyId = Number(params[0]);
        const match = db.tenant_data.find(t => Number(t.company_id) === companyId);
        return match ? [[{ company_id: match.company_id }]] : [[]];
    }
    
    // 6. SELECT u.*, c.name AS company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.email = ?
    if (/SELECT\s+u\.\*,\s*c\.name\s+AS\s+company_name\s+FROM\s+users\s+u/i.test(sqlClean)) {
        const email = String(params[0]).toLowerCase();
        const user = db.users.find(u => u.email.toLowerCase() === email);
        if (user) {
            const comp = db.companies.find(c => c.id === user.company_id);
            return [[{ ...user, company_name: comp ? comp.name : 'Unknown' }]];
        }
        return [[]];
    }
    
    // 7. SELECT id, name, email, role, created_at FROM users WHERE company_id = ?
    if (/SELECT\s+id,\s*name,\s*email,\s*role,\s*created_at\s+FROM\s+users\s+WHERE\s+company_id\s*=\s*\?/i.test(sqlClean)) {
        const companyId = Number(params[0]);
        const matchedUsers = db.users.filter(u => Number(u.company_id) === companyId).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            created_at: new Date().toISOString()
        }));
        return [matchedUsers];
    }
    
    // 8. SELECT id FROM companies WHERE name = ?
    if (/SELECT\s+id\s+FROM\s+companies\s+WHERE\s+name\s*=\s*\?/i.test(sqlClean)) {
        const name = String(params[0]);
        const comp = db.companies.find(c => c.name === name);
        return comp ? [[{ id: comp.id }]] : [[]];
    }
    
    // 9. SELECT id FROM users WHERE email = ?
    if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(sqlClean)) {
        const email = String(params[0]).toLowerCase();
        const user = db.users.find(u => u.email.toLowerCase() === email);
        return user ? [[{ id: user.id }]] : [[]];
    }
    
    // 10. INSERT INTO companies (name) VALUES (?)
    if (/INSERT\s+INTO\s+companies\s*\(\s*name\s*\)\s*VALUES/i.test(sqlClean)) {
        const name = String(params[0]);
        const newId = db.companies.length > 0 ? Math.max(...db.companies.map(c => c.id)) + 1 : 1;
        db.companies.push({ id: newId, name });
        saveLocalDb(db);
        return [{ insertId: newId }];
    }
    
    // 11. INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)
    if (/INSERT\s+INTO\s+users/i.test(sqlClean)) {
        const [company_id, name, email, password_hash, role] = params;
        const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
        db.users.push({ id: newId, company_id: Number(company_id), name, email, password_hash, role });
        saveLocalDb(db);
        return [{ insertId: newId }];
    }
    
    // 12. INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_data = ?
    if (/ON DUPLICATE KEY UPDATE/i.test(sqlClean)) {
        const companyId = Number(params[0]);
        const stateData = String(params[1]);
        const idx = db.tenant_data.findIndex(t => Number(t.company_id) === companyId);
        if (idx !== -1) {
            db.tenant_data[idx].state_data = stateData;
        } else {
            db.tenant_data.push({ company_id: companyId, state_data: stateData });
        }
        saveLocalDb(db);
        return [{}];
    }
    
    // 13. INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)
    if (/INSERT\s+INTO\s+tenant_data/i.test(sqlClean)) {
        const companyId = Number(params[0]);
        const stateData = String(params[1]);
        const idx = db.tenant_data.findIndex(t => Number(t.company_id) === companyId);
        if (idx !== -1) {
            db.tenant_data[idx].state_data = stateData;
        } else {
            db.tenant_data.push({ company_id: companyId, state_data: stateData });
        }
        saveLocalDb(db);
        return [{}];
    }
    
    // 14. DELETE FROM users WHERE id = ? AND company_id = ?
    if (/DELETE\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?\s+AND\s+company_id\s*=\s*\?/i.test(sqlClean)) {
        const id = Number(params[0]);
        const companyId = Number(params[1]);
        db.users = db.users.filter(u => !(u.id === id && u.company_id === companyId));
        saveLocalDb(db);
        return [{}];
    }
    
    // 15. UPDATE users SET password_hash = ? WHERE id = ? AND company_id = ?
    if (/UPDATE\s+users\s+SET\s+password_hash\s*=\s*\?\s+WHERE\s+id\s*=\s*\?\s+AND\s+company_id\s*=\s*\?/i.test(sqlClean)) {
        const passwordHash = String(params[0]);
        const id = Number(params[1]);
        const companyId = Number(params[2]);
        const user = db.users.find(u => u.id === id && u.company_id === companyId);
        if (user) {
            user.password_hash = passwordHash;
            saveLocalDb(db);
        }
        return [{}];
    }
    
    console.warn("Unmatched Mock SQL Query:", sqlClean);
    return [[]];
}

class MockConnection {
    async query(sql, params) {
        return await executeQuery(sql, params);
    }
    async beginTransaction() {}
    async commit() {}
    async rollback() {}
    release() {}
}

const mockPool = {
    async query(sql, params) {
        return await executeQuery(sql, params);
    },
    async getConnection() {
        return new MockConnection();
    }
};

module.exports = mockPool;
