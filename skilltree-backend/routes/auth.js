const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
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

        const verificationLink = `${process.env.CLIENT_URL}/verify/${tokenVerify}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Verify your email",
            html: `
                <h2>Email Verification</h2>
                <p>Click the link below to verify your account:</p>
                <a href="${verificationLink}">${verificationLink}</a>
            `
        });

        response.status(200).json({
            message: "Registered successfully"
        });

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

        res.send("Email verified successfully! You can now log in.");
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
