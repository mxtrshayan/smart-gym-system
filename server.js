const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

/* Middlewares */
app.use(cors());
app.use(bodyParser.json());

/* Serve frontend */
app.use(express.static(path.join(__dirname, 'frontend')));

/* API routes */
app.use('/api', apiRoutes);

/* Fallback: serve frontend index */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
