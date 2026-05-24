const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../db/pool');
const router  = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, empId, department, password } = req.body;
  if (!name || !email || !empId || !password)
    return res.status(400).json({ error: 'name, email, empId and password are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const exists = await pool.query(
      'SELECT id FROM users WHERE email=$1 OR emp_id=$2',
      [email.toLowerCase(), empId.toUpperCase()]
    );
    if (exists.rows.length)
      return res.status(409).json({ error: 'Email or Employee ID already registered' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users (name,email,emp_id,department,password,role)
       VALUES ($1,$2,$3,$4,$5,'employee') RETURNING id,name,email,emp_id,department,role`,
      [name, email.toLowerCase(), empId.toUpperCase(), department || null, hash]
    );
    res.status(201).json({ message: 'Account created', user: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, empId, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  try {
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid email or password' });
    const user = r.rows[0];
    if (user.role !== 'admin' && user.emp_id !== (empId || '').toUpperCase())
      return res.status(401).json({ error: 'Employee ID does not match' });
    if (!await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { id: user.id, empId: user.emp_id, name: user.name, email: user.email, role: user.role, dept: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, empId: user.emp_id, department: user.department, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
