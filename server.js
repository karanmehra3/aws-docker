const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// HTML file serve karne ke liye
app.use(express.static(path.join(__dirname)));

// 🌟 Aapka MongoDB Atlas connection string
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
// 🚀 1. SIGNUP API ENDPOINT (Naya Joda Hai Bhai!)
// ----------------------------------------------------
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check karo ki email aur password khali toh nahi hain
        if (!email || !password) {
            return res.status(400).json({ message: "Bhai email aur password dono daalo!" });
        }

        // Check karo ki ye email pehle se register toh nahi hai
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({ message: "Ye Email pehle se register hai bhee!" });
        }

        // Naya user database mein save karo
        const newUser = new User({ email, password });
        await newUser.save();

        return res.status(201).json({ message: "Signup Successful!" });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// ----------------------------------------------------
// 🔐 2. LOGIN API ENDPOINT (Aapka Purana Wala)
// ----------------------------------------------------
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Database me email aur password check karo
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