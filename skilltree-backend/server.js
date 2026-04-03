require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
app.use(cors({ origin: '...' }))
const app = express();
app.use(express.json());
app.use(cors())
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
app.post('/api/register', async (request, response) => {
    const { firstName, lastName, username, email, password } = request.body;
    try {
        const userExists = await User.findOne({email: email});
        if(userExists){
            return response.status(400).json({error: "Existing User"});
        }
        const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const tokenVerify = crypto.randomBytes(20).toString('hex');
        const UserDetails = new User({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: hashPassword,
            verificationToken: tokenVerify,
            isVerified: false
        })
        await UserDetails.save()
        const mailOptions = {
            from: `"Skill Tree" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Please Verify Your Skill Tree Account',
            html: `Hello ${firstName},<br>Please verify your account by clicking: 
                   <a href="http://${request.headers.host}/api/verify/${tokenVerify}">Verify Email</a>`
        }
        await transporter.sendMail(mailOptions);
        response.status(200).json({error: "", message: "Registered successfully! Please check your email to verify your account."});
    }catch (e) {
        console.error(e);
        response.status(500).json({error: e.toString()});
    }
})
app.post('/api/login', async (request, response) => {
    const { email, password } = request.body;
    try {
        const user = await User.findOne({ email: email });
        if(!user){
            return response.status(400).json({ error: "Invalid email or password" });
        }
        if(!user.isVerified){
            return response.status(401).json({ error: "Email not verified, please check your email" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return response.status(400).json({ error: "Invalid email or password" });
        }
        response.status(200).json({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            error: ""
        });
    }catch (e) {
        console.error(e);
        response.status(500).json({ error: e.toString() });
    }
})
app.get('/api/verify/:token', async (request, response) => {
    try {
        console.log('Token received:', request.params.token);
        const user = await User.findOne({ verificationToken: request.params.token });
        console.log('User found:', user);
        if(!user){
            return response.status(400).send("<h1>Invalid or expired token</h1>");
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        response.redirect('http://localhost:5173/login?verified=true');
    }catch (e){
        console.error('Verify error:', e);
        response.status(500).send("Internal Server Error");
    }
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
