import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // your MySQL username
  password: 'root', // your MySQL password
  database: 'travel_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;