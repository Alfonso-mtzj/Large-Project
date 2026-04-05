const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

// 🔥 Setup SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ================= REGISTER =================
router.post('/register', async (request, response) => {
    const { firstName, lastName, username, email, password } = request.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return response.status(400).json({ error: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const tokenVerify = crypto.randomBytes(20).toString('hex');

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashPassword,
            verificationToken: tokenVerify,
            isVerified: false
        });

        await newUser.save();

        // ✅ Send success immediately
        response.status(200).json({
            message: "Registered successfully! Please check your email."
        });

        // 🔥 Send email via SendGrid
        const verificationLink = `${process.env.CLIENT_URL}/verify/${tokenVerify}`;

        await sgMail.send({
            to: email,
            from: process.env.SMTP_USER, // MUST be verified in SendGrid
            subject: "Verify your email",
            html: `
                <div style="text-align:center; font-family: Arial;">
                    <h2>Welcome to SkillTree 🌱</h2>
                    <p>Please verify your email:</p>
                    <a href="${verificationLink}" 
                       style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
                       Verify Email
                    </a>
                    <p style="margin-top:20px;">Or copy this link:</p>
                    <p>${verificationLink}</p>
                </div>
            `
        }).catch(err => console.error("SendGrid error:", err));

    } catch (e) {
        console.error(e);
        response.status(500).json({ error: e.toString() });
    }
});

// ================= VERIFY =================
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).send("Invalid or expired token");
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.send("Email verified successfully! You can now log in.");
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// ================= LOGIN =================
router.post('/login', async (request, response) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return response.status(400).json({ error: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return response.status(401).json({ error: "Email not verified" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return response.status(400).json({ error: "Invalid email or password" });
        }

        response.json({
            id: user._id,
            email: user.email
        });

    } catch (e) {
        response.status(500).json({ error: e.toString() });
    }
});

module.exports = router;
