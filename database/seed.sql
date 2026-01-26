-- Seed data for Unolo Field Force Tracker
USE unolo_tracker;

-- Insert users (password is 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password, role, manager_id) VALUES
('Amit Sharma', 'manager@unolo.com', '$2b$10$5QzV5G5X5Y5Z5A5B5C5D5e5f5g5h5i5j5k5l5m5n5o5p5q5r5s5t5', 'manager', NULL),
('Rahul Kumar', 'rahul@unolo.com', '$2b$10$5QzV5G5X5Y5Z5A5B5C5D5e5f5g5h5i5j5k5l5m5n5o5p5q5r5s5t5', 'employee', 1),
('Priya Singh', 'priya@unolo.com', '$2b$10$5QzV5G5X5Y5Z5A5B5C5D5e5f5g5h5i5j5k5l5m5n5o5p5q5r5s5t5', 'employee', 1),
('Vikram Patel', 'vikram@unolo.com', '$2b$10$5QzV5G5X5Y5Z5A5B5C5D5e5f5g5h5i5j5k5l5m5n5o5p5q5r5s5t5', 'employee', 1);

-- Insert clients (locations in Gurugram/Delhi NCR)
INSERT INTO clients (name, address, latitude, longitude) VALUES
('ABC Corp', 'Cyber City, Gurugram', 28.4946, 77.0887),
('XYZ Ltd', 'Sector 44, Gurugram', 28.4595, 77.0266),
('Tech Solutions', 'DLF Phase 3, Gurugram', 28.4947, 77.0952),
('Global Services', 'Udyog Vihar, Gurugram', 28.5011, 77.0838),
('Innovate Inc', 'Sector 18, Noida', 28.5707, 77.3219);

-- Assign employees to clients
INSERT INTO employee_clients (employee_id, client_id, assigned_date) VALUES
(2, 1, '2024-01-01'),
(2, 2, '2024-01-01'),
(2, 3, '2024-01-15'),
(3, 2, '2024-01-01'),
(3, 4, '2024-01-01'),
(4, 1, '2024-01-10'),
(4, 5, '2024-01-10');

-- Insert some sample checkins
INSERT INTO checkins (employee_id, client_id, checkin_time, checkout_time, latitude, longitude, notes, status) VALUES
(2, 1, '2024-01-15 09:15:00', '2024-01-15 11:30:00', '28.4946', '77.0887', 'Regular visit', 'checked_out'),
(2, 2, '2024-01-15 12:00:00', '2024-01-15 14:00:00', '28.4595', '77.0266', 'Product demo', 'checked_out'),
(2, 3, '2024-01-15 15:00:00', '2024-01-15 17:30:00', '28.4947', '77.0952', 'Follow up meeting', 'checked_out'),
(3, 2, '2024-01-15 09:30:00', '2024-01-15 12:00:00', '28.4595', '77.0266', 'Contract discussion', 'checked_out'),
(3, 4, '2024-01-15 13:00:00', '2024-01-15 16:00:00', '28.5011', '77.0838', 'New requirements', 'checked_out'),
(2, 1, '2024-01-16 09:00:00', NULL, '28.4950', '77.0890', 'Morning visit', 'checked_in');
