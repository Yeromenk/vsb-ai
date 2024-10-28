import 'dotenv/config';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const authRoutes = require('./routes/auth.js');
const {connectToDatabase} = require('./prisma/db.js');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

connectToDatabase();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});