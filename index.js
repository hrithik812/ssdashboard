const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dashboardRoutes=require('./routes/dashboardRoute')
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/dashboard',dashboardRoutes)
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
