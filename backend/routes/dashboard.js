const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireManager } = require("../middleware/auth");

const router = express.Router();

// Get dashboard stats for manager
router.get("/stats", authenticateToken, requireManager, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get team members
    const [teamMembers] = await pool.execute(
      "SELECT id, name, email FROM users WHERE manager_id = ?",
      [req.user.id],
    );

    // Get today's check-ins for the team
    const [todayCheckins] = await pool.execute(
      `SELECT ch.*, u.name as employee_name, c.name as client_name
             FROM checkins ch
             INNER JOIN users u ON ch.employee_id = u.id
             INNER JOIN clients c ON ch.client_id = c.id
             WHERE u.manager_id = ? AND DATE(ch.checkin_time) = ?
             ORDER BY ch.checkin_time DESC`,
      [req.user.id, today],
    );

    // Get active check-ins count
    const [activeCount] = await pool.execute(
      `SELECT COUNT(*) as count FROM checkins ch
             INNER JOIN users u ON ch.employee_id = u.id
             WHERE u.manager_id = ? AND ch.status = 'checked_in'`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: {
        team_size: teamMembers.length,
        team_members: teamMembers,
        today_checkins: todayCheckins,
        active_checkins: activeCount[0].count,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats" });
  }
});

// Get employee dashboard (for employees)
router.get("/employee", authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get today's check-ins
    const [todayCheckins] = await pool.execute(
      `SELECT ch.*, c.name as client_name
             FROM checkins ch
             INNER JOIN clients c ON ch.client_id = c.id
             WHERE ch.employee_id = ? AND DATE(ch.checkin_time) = ?
             ORDER BY ch.checkin_time DESC`,
      [req.user.id, today],
    );
    console.log("wertyui", todayCheckins);

    // Get assigned clients
    const [clients] = await pool.execute(
      `SELECT c.* FROM clients c
             INNER JOIN employee_clients ec ON c.id = ec.client_id
             WHERE ec.employee_id = ?`,
      [req.user.id],
    );
    console.log("CLIENTS_ON_BACKEND", clients);

    // Get this week's stats
    const [weekStats] = await pool.execute(
      `
  SELECT COUNT(*) AS total_checkins,
         COUNT(DISTINCT client_id) AS unique_clients
  FROM checkins
  WHERE employee_id = ?
    AND checkin_time >= datetime('now', '-7 days')
  `,
      [req.user.id],
    );

    res.json({
      success: true,
      data: {
        today_checkins: todayCheckins,
        assigned_clients: clients,
        week_stats: weekStats[0],
      },
    });
  } catch (error) {
    console.error("Employee dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard" });
  }
});

module.exports = router;
