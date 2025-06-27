require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/Auth');
const cors = require('cors');

const app = express();


app.use(cors({
    origin: 'https://photo-editor-git-master-lus-projects-b20ea231.vercel.app', 
    credentials: true 
  }));
app.use(express.json());

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI);


app.listen(process.env.PORT, () => console.log('Server running on port 5000'));


mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});



