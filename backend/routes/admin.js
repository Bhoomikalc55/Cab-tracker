const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router  = express.Router();

router.use(authMiddleware, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [rides, emps] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER(WHERE status='Active') AS active,
        ROUND(AVG(duration_mins) FILTER(WHERE status='Completed')) AS avg_duration FROM rides`),
      pool.query(`SELECT COUNT(*) AS total FROM users WHERE role='employee'`)
    ]);
    res.json({ ...rides.rows[0], total_employees: emps.rows[0].total });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/rides
router.get('/rides', async (req, res) => {
  const { name, date, status, limit = 100, page = 1 } = req.query;
  const conds = []; const params = [];
  let p = 1;
  if (name)   { conds.push(`(LOWER(emp_name) LIKE $${p} OR LOWER(emp_id) LIKE $${p})`); params.push(`%${name.toLowerCase()}%`); p++; }
  if (date)   { conds.push(`ride_date=$${p}`); params.push(date); p++; }
  if (status) { conds.push(`status=$${p}`); params.push(status); p++; }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  try {
    const [r, c] = await Promise.all([
      pool.query(`SELECT * FROM rides ${where} ORDER BY check_in_time DESC LIMIT $${p} OFFSET $${p+1}`,
        [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]),
      pool.query(`SELECT COUNT(*) FROM rides ${where}`, params)
    ]);
    res.json({ rides: r.rows, total: parseInt(c.rows[0].count) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/rides/export
router.get('/rides/export', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        TO_CHAR(ride_date,'DD-Mon-YYYY')   AS "Date",
        emp_name                           AS "Employee Name",
        emp_id                             AS "Employee ID",
        department                         AS "Department",
        emp_email                          AS "Email",
        source                             AS "Source",
        destination                        AS "Destination",
        cab_number                         AS "Cab Number",
        cab_type                           AS "Cab Type",
        TO_CHAR(check_in_time  AT TIME ZONE 'Asia/Kolkata','DD-Mon-YYYY HH12:MI AM') AS "Check-In Time",
        TO_CHAR(check_out_time AT TIME ZONE 'Asia/Kolkata','DD-Mon-YYYY HH12:MI AM') AS "Check-Out Time",
        duration_mins                      AS "Duration (mins)",
        duration_str                       AS "Duration",
        status                             AS "Status"
      FROM rides ORDER BY check_in_time DESC`);
    res.json({ rows: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/admin/employees
router.get('/employees', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.id,u.name,u.email,u.emp_id,u.department,u.created_at,
        COUNT(r.id) AS total_rides, MAX(r.check_in_time) AS last_ride
      FROM users u LEFT JOIN rides r ON r.user_id=u.id
      WHERE u.role='employee' GROUP BY u.id ORDER BY u.name`);
    res.json({ employees: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
