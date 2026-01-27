const express = require("express");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { calculateDistance } = require("../utils/distance");

const router = express.Router();

// Get assigned clients for employee
router.get("/clients", authenticateToken, async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT DISTINCT c.*
      FROM clients c
      JOIN employee_clients ec ON c.id = ec.client_id
    `);

    res.json({ success: true, data: clients });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
});

// Create new check-in
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { client_id, latitude, longitude, notes } = req.body;
    console.log("AUTH_USER_ID", req.user.id);
    console.log("CLIENT_ID", client_id);

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "Location (latitude and longitude) is required",
      });
    }

    if (!client_id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    // Check assignment
    const [assignments] = await pool.execute(
      "SELECT * FROM employee_clients WHERE employee_id = ? AND client_id = ?",
      [req.user.id, client_id],
    );

    if (assignments.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this client",
      });
    }

    // Check active check-in
    const [activeCheckins] = await pool.execute(
      "SELECT * FROM checkins WHERE employee_id = ? AND status = 'checked_in'",
      [req.user.id],
    );

    if (activeCheckins.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have an active check-in. Please checkout first.",
      });
    }

    // ✅ FETCH CLIENT LOCATION (missing before)
    const [clients] = await pool.execute(
      "SELECT latitude, longitude FROM clients WHERE id = ?",
      [client_id],
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const client = clients[0];

    console.log("CLIENT", client.latitude, client.longitude);

    // ✅ CALCULATE DISTANCE
    const distance = calculateDistance(
      Number(latitude),
      Number(longitude),
      Number(client.latitude),
      Number(client.longitude),
    );

    console.log("distanceInLog", distance);

    // ✅ INSERT WITH DISTANCE
    const [result] = await pool.execute(
      `
  INSERT INTO checkins
  (employee_id, client_id, latitude, longitude, distance_from_client, notes, status)
  VALUES (?, ?, ?, ?, ?, ?, 'checked_in')
  `,
      [
        req.user.id,
        client_id,
        Number(latitude),
        Number(longitude),
        distance,
        notes || null,
      ],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        distance_from_client: distance,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Check-in failed",
    });
  }
});

// Checkout from current location
router.put("/checkout", authenticateToken, async (req, res) => {
  try {
    const [activeCheckins] = await pool.execute(
      "SELECT * FROM checkins WHERE employee_id = ? ORDER BY checkin_time DESC LIMIT 1",
      [req.user.id],
    );

    if (activeCheckins.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No active check-in found" });
    }

    await pool.execute(
      `UPDATE checkins 
   SET checkout_time = datetime('now'), status = 'checked_out' 
   WHERE id = ?`,
      [activeCheckins[0].id],
    );

    res.json({ success: true, message: "Checked out successfully" });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ success: false, message: "Checkout failed onsv" });
  }
});

// Get check-in history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
            SELECT ch.*, c.name as client_name, c.address as client_address
            FROM checkins ch
            INNER JOIN clients c ON ch.client_id = c.id
            WHERE ch.employee_id = ?
        `;
    const params = [req.user.id];

    if (start_date) {
      query += ` AND DATE(ch.checkin_time) >= '${start_date}'`;
    }
    if (end_date) {
      query += ` AND DATE(ch.checkin_time) <= '${end_date}'`;
    }

    query += " ORDER BY ch.checkin_time DESC";

    const [checkins] = await pool.execute(query, params);

    res.json({ success: true, data: checkins });
  } catch (error) {
    console.error("History error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch history" });
  }
});

// Get current active check-in
router.get("/active", authenticateToken, async (req, res) => {
  try {
    const [checkins] = await pool.execute(
      `SELECT ch.*, c.name as client_name 
             FROM checkins ch
             INNER JOIN clients c ON ch.client_id = c.id
             WHERE ch.employee_id = ? AND ch.status = 'checked_in'
             ORDER BY ch.checkin_time DESC LIMIT 1`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: checkins.length > 0 ? checkins[0] : null,
    });
  } catch (error) {
    console.error("Active checkin error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active check-in" });
  }
});

module.exports = router;
