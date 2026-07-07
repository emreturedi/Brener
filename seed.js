const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Mock DOM elements to load app.js state initialization in Node
global.window = {
    location: { hash: '' },
    addEventListener: () => {}
};
global.document = {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Create a placeholder BrenerApp object
global.window.BrenerApp = {};

async function seed() {
    console.log("Seeding database...");
    const pool = require('./database');
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // 1. Create tables if they don't exist by executing schema.sql
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        // Split by semicolon to run statements individually
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (let statement of statements) {
            await connection.query(statement);
        }
        console.log("Database schema tables verified/created.");

        // 2. Insert Default Company
        const [compRows] = await connection.query("SELECT id FROM companies WHERE name = 'Brener Group'");
        let companyId;
        if (compRows.length > 0) {
            companyId = compRows[0].id;
        } else {
            const [compResult] = await connection.query("INSERT INTO companies (name) VALUES ('Brener Group')");
            companyId = compResult.insertId;
        }
        console.log(`Default company 'Brener Group' verified with ID: ${companyId}`);

        // 3. Insert Default Users with hashed passwords
        const defaultUsers = [
            { name: 'Emre Türedi', email: 'admin@brener.com.tr', password: 'admin123', role: 'admin' },
            { name: 'Caner Şen', email: 'sefi@brener.com.tr', password: 'sefi123', role: 'sefi' },
            { name: 'Zeynep Yurt', email: 'muhasebe@brener.com.tr', password: 'muh123', role: 'muhasebe' },
            { name: 'Murat Kara', email: 'saha@brener.com.tr', password: 'saha123', role: 'saha' }
        ];

        for (let user of defaultUsers) {
            const [userRows] = await connection.query("SELECT id FROM users WHERE email = ?", [user.email]);
            if (userRows.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(user.password, salt);
                await connection.query(
                    "INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                    [companyId, user.name, user.email, passwordHash, user.role]
                );
                console.log(`User ${user.name} (${user.role}) seeded.`);
            }
        }

        // 4. Initialize and serialize default state from app.js
        console.log("Loading mock state from app.js...");
        const appJsCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
        
        // Execute app.js in this context to populate BrenerApp
        // We replace document.addEventListener with a dummy trigger to init state
        const sanitizedCode = appJsCode
            .replace("document.addEventListener('DOMContentLoaded'", "function initApp()")
            .replace("window.BrenerApp.init();\n});", "window.BrenerApp.init();\n}");
        
        eval(sanitizedCode);
        
        // Run init to populate data
        window.BrenerApp.init();
        
        // Extract the generated state
        const state = window.BrenerApp.state;
        
        // Clean up UI/runtime properties
        state.currentUser = null;
        state.currentProjectId = null;
        
        // Stringify the state
        const stateJson = JSON.stringify(state);
        
        // Save to database
        const [stateRows] = await connection.query("SELECT company_id FROM tenant_data WHERE company_id = ?", [companyId]);
        if (stateRows.length === 0) {
            await connection.query(
                "INSERT INTO tenant_data (company_id, state_data) VALUES (?, ?)",
                [companyId, stateJson]
            );
            console.log("Default company state data successfully seeded!");
        } else {
            console.log("Default company state data already exists. Skipping state seed.");
        }

        await connection.commit();
        console.log("Seeding process completed successfully!");
        process.exit(0);
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Seeding failed:", err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

seed();
