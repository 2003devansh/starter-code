const express = require("express");
const pool = require("../config/database");
const { authenticateToken, requireManager } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/daily-summary",
  authenticateToken,
  requireManager,
  async (req, res) => {
    try {
      const { date, employee_id } = req.query;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing date (YYYY-MM-DD required)",
        });
      }

      let employeeFilter = "";
      const params = [req.user.id, date];

      if (employee_id) {
        employeeFilter = "AND u.id = ?";
        params.push(employee_id);
      }

      const [employees] = await pool.execute(
        `
        SELECT
          u.id AS employee_id,
          u.name AS employee_name,
          COUNT(ch.id) AS checkins,
          COUNT(DISTINCT ch.client_id) AS clients_visited,
          ROUND(
            SUM(
              TIMESTAMPDIFF(
                MINUTE,
                ch.checkin_time,
                COALESCE(ch.checkout_time, ch.checkin_time)
              )
            ) / 60,
            2
          ) AS working_hours
        FROM users u
        LEFT JOIN checkins ch
          ON ch.employee_id = u.id
          AND DATE(ch.checkin_time) = ?
        WHERE u.manager_id = ?
        ${employeeFilter}
        GROUP BY u.id
        `,
        employee_id ? [date, req.user.id, employee_id] : [date, req.user.id],
      );

      const [teamStats] = await pool.execute(
        `
        SELECT
          COUNT(ch.id) AS total_checkins,
          COUNT(DISTINCT ch.employee_id) AS active_employees,
          COUNT(DISTINCT ch.client_id) AS total_clients_visited
        FROM checkins ch
        INNER JOIN users u ON u.id = ch.employee_id
        WHERE u.manager_id = ?
          AND DATE(ch.checkin_time) = ?
        `,
        [req.user.id, date],
      );

      res.json({
        success: true,
        data: {
          date,
          team_summary: teamStats[0],
          employees,
        },
      });
    } catch (error) {
      console.error("Daily summary error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch daily summary",
      });
    }
  },
);

module.exports = router;
