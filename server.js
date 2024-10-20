const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const SECRET = 'your_jwt_secret';  // Change this to a strong secret key

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Connect to the MySQL database
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',            // Your MySQL username
  password: '1234',    // Your MySQL password
  database: 'caremind'     // Database name as per your SQL file
});


db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO user (email, name, password) VALUES (?, ?, ?)';
  db.query(sql, [email, name, hashedPassword], (err, result) => {
    if (err) {
        console.error('Error inserting user:', err); 
        return res.status(500).json({ message: 'Error inserting user' });
      }
    res.json({ message: 'User registered successfully!' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
          res.json({ success: true, token });
        } else {
          res.status(400).json({ message: 'Incorrect password' });
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
