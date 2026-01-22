const mysql = require('mysql2');

/* Debug: confirm Railway is reading environment variables */
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);

/* Create MySQL connection using environment variables */
const connection = mysql.createConnection({
  host: process.env.DB_HOST,                 // Railway env variable
  user: process.env.DB_USER,                 // Railway env variable
  password: process.env.DB_PASSWORD,         // Railway env variable
  database: process.env.DB_NAME,             // Railway env variable
  port: Number(process.env.DB_PORT),         // convert port to number
  ssl: { rejectUnauthorized: false }         // allow self-signed certificate (Aiven)
});

/* Connect to database */
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = connection;
