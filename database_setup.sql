-- Hotel Management System Database Setup

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hotel_management;

-- Use the database
USE hotel_management;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Guests table
CREATE TABLE IF NOT EXISTS Guests (
  guest_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create RoomTypes table
CREATE TABLE IF NOT EXISTS RoomTypes (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL
);

-- Create Rooms table
CREATE TABLE IF NOT EXISTS Rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL UNIQUE,
  type_id INT NOT NULL,
  floor VARCHAR(10),
  status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
  FOREIGN KEY (type_id) REFERENCES RoomTypes(type_id)
);

-- Create Bookings table
CREATE TABLE IF NOT EXISTS Bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status ENUM('Confirmed', 'Cancelled', 'Completed') DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES Guests(guest_id),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS Payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer') NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

-- Create Services table
CREATE TABLE IF NOT EXISTS Services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL
);

-- Create BookingServices table
CREATE TABLE IF NOT EXISTS BookingServices (
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  PRIMARY KEY (booking_id, service_id),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
  FOREIGN KEY (service_id) REFERENCES Services(service_id)
);

-- Insert sample data for RoomTypes
INSERT INTO RoomTypes (type_name, description, price_per_night) VALUES
('Standard', 'One queen bed, basic amenities', 99.99),
('Deluxe', 'One king bed, premium amenities', 149.99),
('Suite', 'Separate living area, king bed, luxury amenities', 249.99),
('Family', 'Two queen beds, spacious room for families', 179.99);

-- Insert sample data for Rooms
INSERT INTO Rooms (room_number, type_id, floor, status) VALUES
('101', 1, '1', 'Available'),
('102', 1, '1', 'Available'),
('201', 2, '2', 'Available'),
('202', 2, '2', 'Available'),
('301', 3, '3', 'Available'),
('302', 3, '3', 'Available'),
('401', 4, '4', 'Available'),
('402', 4, '4', 'Available');

-- Insert sample data for Services
INSERT INTO Services (service_name, description, price) VALUES
('Room Service', 'Food and beverage delivered to your room', 15.00),
('Spa Treatment', 'Relaxing massage and spa services', 89.99),
('Airport Shuttle', 'Transportation to and from the airport', 25.00),
('Laundry', 'Washing and ironing services', 20.00),
('Breakfast', 'Continental breakfast', 12.99);