const path = require('path');
app.use(express.static('frontend')); 

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); 
const apiRoutes = require('./routes'); 

const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend')); 

app.use('/api', apiRoutes); 


app.get('/', (req, res) => {
    res.send('Gym & Wellness Backend is Running!');
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

