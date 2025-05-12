const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlScript = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');

// Create connection to MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
  multipleStatements: true // Important for executing multiple SQL statements
});

// Connect to MySQL
console.log('Connecting to MySQL...');
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL successfully!');

  // Execute the SQL script
  console.log('Executing database setup script...');
  connection.query(sqlScript, (err, results) => {
    if (err) {
      console.error('Error executing SQL script:', err);
    } else {
      console.log('Database setup completed successfully!');
    }

    // Close the connection
    connection.end(err => {
      if (err) {
        console.error('Error closing connection:', err);
      } else {
        console.log('Connection closed.');
      }
    });
  });
});