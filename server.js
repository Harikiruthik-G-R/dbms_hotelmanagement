const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 7077;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotel_managements',
  port: 3307
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Successfully connected to the hotel_management database!');
});

// API Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Users API
app.post('/api/users', (req, res) => {
  const { username, email, phone, password } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  const query = 'INSERT INTO Users (username, email, phone, password) VALUES (?, ?, ?, ?)';
  
  db.query(query, [username, email, phone, password], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  });
});

// Guests API
app.post('/api/guests', (req, res) => {
  const { full_name, phone, email, address } = req.body;
  
  // Validate required fields
  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Full name and phone are required' });
  }
  
  // Check if the table has guest_id as auto increment
  const query = 'INSERT INTO Guests (full_name, phone, email, address) VALUES (?, ?, ?, ?)';
  
  db.query(query, [full_name, phone, email, address], (err, result) => {
    if (err) {
      console.error('Error creating guest:', err);
      
      // Try alternative query format if the first one fails
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const altQuery = 'INSERT INTO Guests (guest_id, full_name, phone, email, address) VALUES (NULL, ?, ?, ?, ?)';
        db.query(altQuery, [full_name, phone, email, address], (altErr, altResult) => {
          if (altErr) {
            console.error('Error in alternative guest creation:', altErr);
            return res.status(500).json({ error: 'Failed to create guest', details: altErr.message });
          }
          res.status(201).json({ id: altResult.insertId, message: 'Guest created successfully' });
        });
      } else {
        return res.status(500).json({ error: 'Failed to create guest', details: err.message });
      }
    } else {
      res.status(201).json({ id: result.insertId, message: 'Guest created successfully' });
    }
  });
});

// Bookings API
app.post('/api/bookings', (req, res) => {
  const { guest_id, room_id, check_in, check_out, status } = req.body;
  
  // Validate required fields
  if (!guest_id || !room_id || !check_in || !check_out || !status) {
    console.error('Missing required booking fields:', { guest_id, room_id, check_in, check_out, status });
    return res.status(400).json({ error: 'All booking fields are required' });
  }
  
  // Format dates consistently for MySQL
  const formattedCheckIn = new Date(check_in).toISOString().split('T')[0];
  const formattedCheckOut = new Date(check_out).toISOString().split('T')[0];
  
  // Log detailed information
  console.log('Creating booking with data:', { 
    guest_id, 
    room_id, 
    check_in: formattedCheckIn, 
    check_out: formattedCheckOut, 
    status 
  });
  
  // Try with auto-increment field
  const query = 'INSERT INTO Bookings (guest_id, room_id, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [guest_id, room_id, formattedCheckIn, formattedCheckOut, status], (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      
      // Try alternative query format if the first one fails
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const altQuery = 'INSERT INTO Bookings (booking_id, guest_id, room_id, check_in, check_out, status) VALUES (NULL, ?, ?, ?, ?, ?)';
        db.query(altQuery, [guest_id, room_id, formattedCheckIn, formattedCheckOut, status], (altErr, altResult) => {
          if (altErr) {
            console.error('Error in alternative booking creation:', altErr);
            return res.status(500).json({ error: 'Failed to create booking', details: altErr.message });
          }
          
          // Update room status to 'Booked'
          const updateRoomQuery = 'UPDATE Rooms SET status = "Booked" WHERE room_id = ?';
          db.query(updateRoomQuery, [room_id], (updateErr) => {
            if (updateErr) {
              console.error('Error updating room status:', updateErr);
              // Continue despite room status update error
            }
            
            res.status(201).json({ id: altResult.insertId, message: 'Booking created successfully' });
          });
        });
      } else {
        return res.status(500).json({ error: 'Failed to create booking', details: err.message });
      }
    } else {
      // Update room status to 'Booked'
      const updateRoomQuery = 'UPDATE Rooms SET status = "Booked" WHERE room_id = ?';
      db.query(updateRoomQuery, [room_id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating room status:', updateErr);
          // Continue despite room status update error
        }
        
        res.status(201).json({ id: result.insertId, message: 'Booking created successfully' });
      });
    }
  });
});

// Payments API
app.post('/api/payments', (req, res) => {
  const { booking_id, amount, payment_date, payment_method } = req.body;
  
  // Validate required fields
  if (!booking_id || !amount || !payment_date || !payment_method) {
    return res.status(400).json({ error: 'All payment fields are required' });
  }
  
  console.log('Creating payment with data:', { booking_id, amount, payment_date, payment_method });
  
  // Try with auto-increment field
  const query = 'INSERT INTO Payments (booking_id, amount, payment_date, payment_method) VALUES (?, ?, ?, ?)';
  
  db.query(query, [booking_id, amount, payment_date, payment_method], (err, result) => {
    if (err) {
      console.error('Error creating payment:', err);
      
      // Try alternative query format if the first one fails
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const altQuery = 'INSERT INTO Payments (payment_id, booking_id, amount, payment_date, payment_method) VALUES (NULL, ?, ?, ?, ?)';
        db.query(altQuery, [booking_id, amount, payment_date, payment_method], (altErr, altResult) => {
          if (altErr) {
            console.error('Error in alternative payment creation:', altErr);
            return res.status(500).json({ error: 'Failed to create payment', details: altErr.message });
          }
          res.status(201).json({ id: altResult.insertId, message: 'Payment created successfully' });
        });
      } else {
        return res.status(500).json({ error: 'Failed to create payment', details: err.message });
      }
    } else {
      res.status(201).json({ id: result.insertId, message: 'Payment created successfully' });
    }
  });
});

// Booking Services API
app.post('/api/booking-services', (req, res) => {
  const { booking_id, service_id, quantity } = req.body;
  
  // Validate required fields
  if (!booking_id || !service_id || !quantity) {
    return res.status(400).json({ error: 'All booking service fields are required' });
  }
  
  const query = 'INSERT INTO BookingServices (booking_id, service_id, quantity) VALUES (?, ?, ?)';
  
  db.query(query, [booking_id, service_id, quantity], (err, result) => {
    if (err) {
      console.error('Error adding booking service:', err);
      return res.status(500).json({ error: 'Failed to add booking service', details: err.message });
    }
    res.status(201).json({ message: 'Booking service added successfully' });
  });
});

// Admin search by email
app.get('/api/search', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }

  const query = `
    SELECT 
      g.*, 
      b.*, 
      r.*, 
      rt.*, 
      p.*, 
      s.*, 
      bs.*
    FROM 
      Guests g
    LEFT JOIN 
      Bookings b ON g.guest_id = b.guest_id
    LEFT JOIN 
      Rooms r ON b.room_id = r.room_id
    LEFT JOIN 
      RoomTypes rt ON r.type_id = rt.type_id
    LEFT JOIN 
      Payments p ON b.booking_id = p.booking_id
    LEFT JOIN 
      BookingServices bs ON b.booking_id = bs.booking_id
    LEFT JOIN 
      Services s ON bs.service_id = s.service_id
    WHERE 
      g.email = ?
  `;
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error searching by email:', err);
      return res.status(500).json({ error: 'Failed to search by email' });
    }
    res.json(results);
  });
});

app.get('/api/bookings/checkin-range', (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to dates are required' });
  }

  const query = `
    SELECT 
      g.*, 
      b.*
    FROM 
      Guests g
    INNER JOIN 
      Bookings b ON g.guest_id = b.guest_id
    WHERE 
      b.check_in BETWEEN ? AND ?
  `;

  db.query(query, [from, to], (err, results) => {
    if (err) {
      console.error('Error searching bookings by date range:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});


// Get all services for form dropdown
app.get('/api/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) {
      console.error('Error fetching services:', err);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }
    res.json(results);
  });
});

// Get all room types for form dropdown
app.get('/api/roomtypes', (req, res) => {
  db.query('SELECT * FROM RoomTypes', (err, results) => {
    if (err) {
      console.error('Error fetching room types:', err);
      return res.status(500).json({ error: 'Failed to fetch room types' });
    }
    res.json(results);
  });
});

// Get all available rooms for form dropdown
app.get('/api/rooms/available', (req, res) => {
  db.query('SELECT * FROM Rooms WHERE status = "Available"', (err, results) => {
    if (err) {
      console.error('Error fetching available rooms:', err);
      return res.status(500).json({ error: 'Failed to fetch available rooms' });
    }
    res.json(results);
  });
});

// Update booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { guest_id, room_id, check_in, check_out, status } = req.body;
  
  const query = 'UPDATE Bookings SET guest_id = ?, room_id = ?, check_in = ?, check_out = ?, status = ? WHERE booking_id = ?';
  
  db.query(query, [guest_id, room_id, check_in, check_out, status, id], (err, result) => {
    if (err) {
      console.error('Error updating booking:', err);
      return res.status(500).json({ error: 'Failed to update booking' });
    }
    res.json({ message: 'Booking updated successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});