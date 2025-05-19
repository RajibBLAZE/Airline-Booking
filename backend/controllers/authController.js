const User = require('../models/userModel');
const client = require('../utils/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mailer');
require('dotenv').config();

async function handleUserRegistration(req, res) {
    try {
        const { username, email, phone, password, isStudent } = req.body;

        //  Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashed = await bcrypt.hash(password, 10);

        //  Create the user
        const user = await User.create({
            username,
            email,
            phone,
            password: hashed,
            isStudent
        });

        //Generate and store verification code in Redis (TTL: 5 min)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await client.setEx(`verify:${email}`, 300, code);

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            text: `Your verification code is: ${code}`,
        });

        // Respond success
        res.status(201).json({
            message: 'User created successfully. Check email for verification code.'
        });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function handleVerifyEmail(req, res){
    try {
        const {email, code} = req.body;
        const stored = await client.get(`verify:${email}`);

        if( stored === code){
            await User.updateOne({email}, { $set: {
                isEmailVerified: true
            }});
            await client.del(`verify:${email}`);
            return res.status(200).json({
                message: 'Email verified successfully !'
            });
        }
        res.status(400).json({ message: 'Invalid or expired code' });
    } catch (error) {
        console.error('Verify Email Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function handleLoginUser(req, res){
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
};

module.exports = {
    handleUserRegistration,
    handleLoginUser,
    handleVerifyEmail
}
