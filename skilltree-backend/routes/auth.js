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
        console.log("TOKEN FROM URL:", req.params.token);
        const user = await User.findOne({ verificationToken: req.params.token });
        console.log("TOKEN FROM URL:", req.params.token);

        if (!user) {
            return res.status(400).send("Invalid or expired token");
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.send("Email verified successfully! You can now log in.");
    } catch (err) {
        console.error(err);
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
            username: user.username //added line 4/15 10:21am
        });

    } catch (e) {
        response.status(500).json({ error: e.toString() });
    }
});

// ================= FORGOT PASSWORD =================
// Sends a reset link to the user's email (does NOT reveal whether email exists)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Always respond with success message (security best practice)
        const genericMsg = "If that email exists, a password reset link has been sent.";

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });

        // If user doesn't exist, still return generic message
        if (!user) {
            return res.status(200).json({ message: genericMsg });
        }

        // Optional: you can require verification before allowing reset
        // If you want that, uncomment:
        // if (!user.isVerified) {
        //   return res.status(200).json({ message: genericMsg });
        // }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send reset email via SendGrid
        await sgMail.send({
            to: email,
            from: process.env.SMTP_USER, // MUST be verified in SendGrid
            subject: "Reset your SkillTree password",
            html: `
                <div style="text-align:center; font-family: Arial;">
                    <h2>Password Reset Request</h2>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetLink}" 
                       style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
                       Reset Password
                    </a>
                    <p style="margin-top:20px;">Or copy this link:</p>
                    <p>${resetLink}</p>
                    <p style="margin-top:20px; font-size:12px; color:#666;">
                      This link expires in 1 hour.
                    </p>
                </div>
            `
        }).catch(err => console.error("SendGrid error:", err));

        return res.status(200).json({ message: genericMsg });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ================= RESET PASSWORD =================
// Resets password using token from the email link
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() } // must not be expired
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user.password = hashPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
