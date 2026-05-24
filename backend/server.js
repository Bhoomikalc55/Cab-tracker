require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const pool    = require('./db/pool');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.use('/api/auth',  require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_,res) => res.json({ status:'ok', ts: new Date().toISOString() }));

// Serve frontend in production (when both are in same repo)
if (process.env.NODE_ENV === 'production') {
  const fp = path.join(__dirname, '../frontend');
  if (fs.existsSync(fp)) {
    app.use(express.static(fp));
    app.get('*', (_,res) => res.sendFile(path.join(fp,'index.html')));
  }
}

app.use((err,_,res,__) => { console.error(err); res.status(500).json({ error:'Internal error' }); });

// Auto-run schema on startup
async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname,'db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅  Database ready');
  } catch (e) {
    console.error('DB init error:', e.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚖 CabTrack API → http://localhost:${PORT}`));
});
