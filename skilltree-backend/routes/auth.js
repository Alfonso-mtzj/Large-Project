const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, //important cuz its gotta be false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 //forces IPv4
});

// ✅ REMOVE /api HERE
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

        response.status(200).json({
            message: "Registered successfully! Please check your email."
        });

        // send email AFTER response
        const verificationLink = `${process.env.CLIENT_URL}/verify/${tokenVerify}`;

        await transporter.sendMail({
            from: `"SkillTree" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify your email",
            html: `
                <div style="font-family: Arial; text-align: center;">
                    <h2>Welcome to SkillTree 🌱</h2>
                    <p>Please verify your email to activate your account.</p>
                    <a href="${verificationLink}" 
                       style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                       Verify Email
                    </a>
                    <p style="margin-top: 20px;">Or copy this link:</p>
                    <p>${verificationLink}</p>
                </div>
            `
        }).catch(err => console.error("Email error:", err));
    } catch (e) {
        console.error(e);
        response.status(500).json({ error: e.toString() });
    }
});

//email verification
router.get('/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).send("Invalid or expired token");
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json("Email verified successfully! You can now log in.");
    } catch (err) {
        res.status(500).send("Server error");
    }
});

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
