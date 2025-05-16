const express = require('express');
const cors = require('cors');

require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.listen(3005, () => console.log('🚀 Server running on port 3001'));