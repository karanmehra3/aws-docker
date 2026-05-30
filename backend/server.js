const express = require('express');
const mysql = require('mysql2'); // 👈 1. Mongoose ki jagah ab MySQL use hoga
const path = require('path');
const cors = require('cors'); 

const app = express();

app.use(cors()); 
app.use(express.json());

// 💥 LINE 9 WALI STATIC SERVING BALI LINE HATA DI HAI KYUNKI FRONTEND ALAG HAI

// ☁️ AWS RDS (Cloud MySQL) Connection Settings
// ⚠️ JAB RDS BAN JAYE, TO ENPOINT YAHAN HOST ME PASTE KARNA
const db = mysql.createConnection({
    host: 'database-1.cti2ceeogmj2.us-east-2.rds.amazonaws.com', // 👈 AWS RDS Endpoint yahan aayega
    user: 'root',                                  // 👈 RDS ka username
    password: 'kannu123',                          // 👈 RDS ka password                          // 👈 Database ka naam
    port: 3306                                     // 👈 MySQL ka port
});

db.connect((err) => {
    if (err) {
        console.error('AWS RDS Cloud DB Connection Failed: ' + err.stack);
        return;
    }
    console.log('AWS RDS Cloud MySQL Connected Successfully! ☁️🐬🔥');
    
    // 📊 USERS TABLE CREATION (Jaise MongoDB me schema tha, yahan Table banegi)
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
    `;
    db.query(createTableQuery, (err) => {
        if (err) {
            console.log("Table banane me dikkat: ", err);
        } else {
            // Table banne ke baad hi dummy user check karenge
            createDummyUser();
        }
    });
});

// 👥 Ek dummy user auto-create karne ke liye
function createDummyUser() {
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, ['admin@test.com'], (err, results) => {
        if (err) return console.log("Dummy user check karne me dikkat:", err.message);

        if (results.length === 0) {
            const insertDummyQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(insertDummyQuery, ['admin@test.com', 'password123'], (err) => {
                if (err) console.log("Dummy user banane me dikkat:", err.message);
                else console.log("Dummy User Created: admin@test.com / password123");
            });
        }
    });
}

// ----------------------------------------------------
// 🚀 1. SIGNUP API ENDPOINT (MySQL Tarika)
// ----------------------------------------------------
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Bhai email aur password dono daalo!" });
    }

    // Pehle check karo user pehle se hai ya nahi
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error("Signup Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Ye Email pehle se register hai bhee!" });
        }

        // Agar naya user hai toh Insert kar do
        const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(insertUserQuery, [email, password], (err, result) => {
            if (err) {
                console.error("Signup Error:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            return res.status(201).json({ message: "Signup Successful!" });
        });
    });
});

// ----------------------------------------------------
// 🔐 2. LOGIN API ENDPOINT (MySQL Tarika)
// ----------------------------------------------------
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const selectQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(selectQuery, [email, password], (err, results) => {
        if (err) {
            console.error("Login Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        
        if (results.length > 0) {
            return res.status(200).json({ message: "Successfully Login" });
        } else {
            return res.status(401).json({ message: "Wrong Email or Password!" });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));