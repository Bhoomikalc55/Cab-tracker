const express = require('express');
const pool    = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const router  = express.Router();

router.use(authMiddleware);

// POST /api/rides/checkin
router.post('/checkin', async (req, res) => {
  const { source, destination, cabNumber, cabType } = req.body;
  const { id, empId, name, email, dept } = req.user;
  if (!source || !destination)
    return res.status(400).json({ error: 'Source and destination are required' });
  try {
    const active = await pool.query(
      `SELECT id FROM rides WHERE user_id=$1 AND status='Active'`, [id]);
    if (active.rows.length)
      return res.status(409).json({ error: 'You already have an active ride. Check out first.' });
    const r = await pool.query(
      `INSERT INTO rides (user_id,emp_id,emp_name,emp_email,department,source,destination,cab_number,cab_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, empId, name, email, dept||null, source, destination, cabNumber||null, cabType||null]
    );
    res.status(201).json({ message: 'Checked in', ride: r.rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/rides/checkout
router.post('/checkout', async (req, res) => {
  const { id } = req.user;
  try {
    const r = await pool.query(
      `SELECT * FROM rides WHERE user_id=$1 AND status='Active' ORDER BY check_in_time DESC LIMIT 1`, [id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No active ride found' });
    const ride = r.rows[0];
    const now = new Date();
    const mins = Math.round((now - new Date(ride.check_in_time)) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    const dStr = h ? `${h}h ${m}m` : `${m} min`;
    const upd = await pool.query(
      `UPDATE rides SET check_out_time=$1,duration_mins=$2,duration_str=$3,status='Completed'
       WHERE id=$4 RETURNING *`,
      [now.toISOString(), mins, dStr, ride.id]
    );
    res.json({ message: 'Checked out', ride: upd.rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/rides/active
router.get('/active', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM rides WHERE user_id=$1 AND status='Active' LIMIT 1`, [req.user.id]);
    res.json({ ride: r.rows[0] || null });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/rides/mine
router.get('/mine', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM rides WHERE user_id=$1 ORDER BY check_in_time DESC`, [req.user.id]);
    res.json({ rides: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/rides/stats
router.get('/stats', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status='Completed') AS total,
         COUNT(*) FILTER (WHERE status='Completed' AND DATE_TRUNC('month',ride_date)=DATE_TRUNC('month',CURRENT_DATE)) AS this_month,
         ROUND(AVG(duration_mins) FILTER (WHERE status='Completed')) AS avg_duration
       FROM rides WHERE user_id=$1`, [req.user.id]);
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
