-- Unolo Field Force Tracker - Database Schema

CREATE DATABASE IF NOT EXISTS unolo_tracker;
USE unolo_tracker;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('employee', 'manager') DEFAULT 'employee',
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee-Client assignments
CREATE TABLE employee_clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    client_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Attendance/Check-ins table
CREATE TABLE checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    client_id INT NOT NULL,
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checkout_time TIMESTAMP NULL,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    distance_from_client DECIMAL(10, 2) NULL,
    notes TEXT,
    status ENUM('checked_in', 'checked_out') DEFAULT 'checked_in'
);

-- Create indexes for performance
CREATE INDEX idx_checkins_employee ON checkins(employee_id);
CREATE INDEX idx_checkins_date ON checkins(checkin_time);
CREATE INDEX idx_employee_clients ON employee_clients(employee_id, client_id);
