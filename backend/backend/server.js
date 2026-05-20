const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting
const requestCounts = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!requestCounts[ip]) requestCounts[ip] = [];
  requestCounts[ip] = requestCounts[ip].filter(t => now - t < 60000);
  if (requestCounts[ip].length > 100) return res.status(429).json({ error: 'Too many requests' });
  requestCounts[ip].push(now);
  next();
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'inuni',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'dreamteam',
});

const JWT_SECRET = process.env.JWT_SECRET || 'inuni-secret-key';

function generateId() { return crypto.randomUUID(); }
function hashPassword(p) { return crypto.createHash('sha256').update(p).digest('hex'); }
function generateToken(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 86400000 })).toString('base64');
  return `${payload}.${crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex')}`;
}
function verifyToken(token) {
  try {
    const [payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch { return null; }
}

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  req.user = decoded;
  next();
}

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY, first_name TEXT, last_name TEXT,
      email TEXT, role TEXT, about TEXT, interests TEXT[]
    );
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      description TEXT, category TEXT, owner_id TEXT, created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY, team_id TEXT, user_id TEXT,
      message TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const id = generateId();
    await pool.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, hashPassword(password)]);
    await pool.query('INSERT INTO profiles (id, first_name, last_name, email) VALUES ($1, $2, $3, $4)', [id, firstName, lastName, email]);
    res.json({ token: generateToken(id), userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password_hash = $2', [email, hashPassword(password)]);
    if (!rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: generateToken(rows[0].id), userId: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profiles/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.id]);
  res.json(rows[0] || null);
});

app.put('/api/profiles/:id', authenticateToken, async (req, res) => {
  const { first_name, last_name, role, about, interests } = req.body;
  await pool.query('UPDATE profiles SET first_name=$1, last_name=$2, role=$3, about=$4, interests=$5 WHERE id=$6',
    [first_name, last_name, role, about, interests, req.params.id]);
  res.json({ success: true });
});

app.get('/api/teams', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM teams ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/teams', authenticateToken, async (req, res) => {
  const { name, description, category } = req.body;
  const id = generateId();
  await pool.query('INSERT INTO teams (id, name, description, category, owner_id) VALUES ($1,$2,$3,$4,$5)',
    [id, name, description, category, req.user.userId]);
  res.json({ id, name });
});

const PORT = process.env.PORT || 8080;
initDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
