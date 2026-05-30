const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // 👈 1. YAHAN CORS IMPORT KIYA

const app = express();

app.use(cors()); // 👈 2. YAHAN EXPRESS KO BOLA CORS ALLOW KARE
app.use(express.json());

// 💥 LINE 9 WALI STATIC SERVING BALI LINE HATA DI HAI KYUNKI FRONTEND ALAG HAI

// 🌟 Aapka MongoDB Atlas connection string (Isko aise hi rehne diya cloud ke liye)
const MONGO_URI = "mongodb+srv://kannu:kannu123@cluster0.iqfnkwx.mongodb.net/logindb?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Web Database Connected! 🔥"))
  .catch(err => console.log("DB Connection Error: ", err));

// Database Schema (User ka structure)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Agar model pehle se bana ho toh use karein, nahi toh naya banayein
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Ek dummy user auto-create karne ke liye
async function createDummyUser() {
    try {
        const userExist = await User.findOne({ email: "admin@test.com" });
        if (!userExist) {
            await User.create({ email: "admin@test.com", password: "password123" });
            console.log("Dummy User Created: admin@test.com / password123");
        }
    } catch (err) {
        console.log("Dummy user banane me dikkat: ", err.message);
    }
}
createDummyUser();

// ----------------------------------------------------
// 🚀 1. SIGNUP API ENDPOINT 
// ----------------------------------------------------
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Bhai email aur password dono daalo!" });
        }

        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({ message: "Ye Email pehle se register hai bhee!" });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        return res.status(201).json({ message: "Signup Successful!" });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// ----------------------------------------------------
// 🔐 2. LOGIN API ENDPOINT
// ----------------------------------------------------
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email, password: password });
        
        if (user) {
            return res.status(200).json({ message: "Successfully Login" });
        } else {
            return res.status(401).json({ message: "Wrong Email or Password!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));