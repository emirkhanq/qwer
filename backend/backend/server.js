const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ===== JWT CONFIGURATION =====
const JWT_SECRET = process.env.JWT_SECRET || 'inuni-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'inuni-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 дней

// ===== JWT UTILITIES =====
function generateTokens(user) {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      is_admin: user.is_admin 
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}

// ===== JWT AUTHENTICATION MIDDLEWARE =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
  
  req.user = decoded;
  next();
}

// ===== AUTHORIZATION MIDDLEWARE =====
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ===== SECURITY (DevSecOps) =====
// Rate limiting для API (100 запросов за 15 минут с одного IP)
const requestCounts = new Map();
const RATE_LIMIT = process.env.NODE_ENV === 'production' ? 100 : 1000;
const RATE_WINDOW = 15 * 60 * 1000; // 15 минут

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  
  const record = requestCounts.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  record.count++;
  next();
}

// Очистка старых записей каждые 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) requestCounts.delete(ip);
  }
}, 10 * 60 * 1000);

// Security headers middleware
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// Input validation middleware
function validateInput(req, res, next) {
  // Sanitize string inputs - remove HTML tags
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/<[^>]*>/g, ''); // Remove all HTML tags
      }
    }
  }
  next();
}

// Apply middleware
app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(validateInput);
app.use('/uploads', express.static('uploads', { 
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Создаём папку для загрузок
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, 'photo_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения!'));
    }
  }
});

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inuni',
  user: process.env.DB_USER || 'inuni_user',
  password: process.env.DB_PASSWORD || 'dreamteam'
});

// Хеширование пароля
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Генерация ID
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Инициализация таблиц
async function initDB() {
  try {
    // Сначала создаем базовые таблицы (без is_admin для совместимости)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Добавляем колонку is_admin если её нет
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`);
      console.log('✅ is_admin column added/verified');
    } catch (e) {
      console.log('Note: is_admin column:', e.message);
    }
    
    // Таблица для JWT refresh tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Индекс для быстрого поиска токенов
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`);
    
    // Продолжаем с остальными таблицами
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        role TEXT,
        direction TEXT,
        course TEXT,
        education TEXT,
        about TEXT,
        interests TEXT[],
        profile_photo TEXT,
        github TEXT,
        linkedin TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        owner_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT,
        user_id TEXT,
        role TEXT,
        status TEXT DEFAULT 'accepted',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        team_id TEXT,
        user_id TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        team_id TEXT,
        user_id TEXT,
        content TEXT,
        channel_type TEXT DEFAULT 'team',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS hackathons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        full_description TEXT,
        start_date DATE,
        end_date DATE,
        registration_deadline DATE,
        status TEXT DEFAULT 'upcoming',
        format TEXT DEFAULT 'offline',
        location TEXT,
        max_teams INTEGER DEFAULT 50,
        team_size TEXT DEFAULT '3-5',
        prize_fund TEXT,
        prize_description TEXT,
        requirements TEXT,
        target_audience TEXT,
        difficulty_level TEXT DEFAULT 'intermediate',
        technologies TEXT[],
        organizer_name TEXT,
        organizer_contact TEXT,
        website_url TEXT,
        image_url TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Индексы для производительности
      CREATE INDEX IF NOT EXISTS idx_messages_team_id ON messages(team_id);
      CREATE INDEX IF NOT EXISTS idx_messages_channel_type ON messages(channel_type);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_team_created ON messages(team_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
    `);
    
    // Миграция: добавляем недостающие колонки в hackathons если их нет
    try {
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS full_description TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_deadline DATE`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'offline'`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS location TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS team_size TEXT DEFAULT '3-5'`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prize_fund TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prize_description TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS requirements TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS target_audience TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'intermediate'`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS technologies TEXT[]`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS organizer_name TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS organizer_contact TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS website_url TEXT`);
      await pool.query(`ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS image_url TEXT`);
      console.log('✅ Hackathons table migrated');
    } catch (migrateErr) {
      console.log('Migration note:', migrateErr.message);
    }

    // Миграция: добавляем недостающие колонки в profiles
    try {
      await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT`);
      await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university TEXT`);
      await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skill_levels JSONB`);
      await pool.query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'student'`);
      console.log('✅ Profiles table migrated');
    } catch (migrateErr) {
      console.log('Profiles migration note:', migrateErr.message);
    }
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ DB init error:', err);
  }
}

// ===== AUTH API with JWT =====

// Регистрация с JWT
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Валидация
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email and password (min 6 chars) required' });
    }
    
    const userId = generateId();
    const passwordHash = hashPassword(password);
    
    // Проверка существующего пользователя
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [userId, email, passwordHash]
    );
    
    await pool.query(
      'INSERT INTO profiles (id, first_name, last_name, email, role, course, interests) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId, firstName, lastName, email, 'Frontend Dev', '3 курс', []]
    );
    
    // Генерируем JWT токены
    const user = { id: userId, email, is_admin: false };
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Сохраняем refresh token в БД
    await pool.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [refreshToken, userId]
    );
    
    res.json({ 
      success: true, 
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Логин с JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordHash = hashPassword(password);
    
    const { rows } = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE email = $1 AND password_hash = $2',
      [email, passwordHash]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Генерируем JWT токены
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Сохраняем refresh token в БД
    await pool.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [refreshToken, user.id]
    );
    
    res.json({ 
      success: true, 
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Обновление access token через refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Проверяем валидность токена
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    // Проверяем существование токена в БД
    const { rows } = await pool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token not found or expired' });
    }
    
    // Получаем данные пользователя
    const { rows: users } = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Генерируем новый access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.json({ accessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Логаут - удаление refresh token
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить текущего пользователя
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== PROFILES API =====

// Получить профиль
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить профиль (требует JWT авторизации)
app.put('/api/profiles/:id', authenticateToken, async (req, res) => {
  try {
    // Проверяем что пользователь может обновлять только свой профиль
    // (или админ может любой)
    const userId = req.params.id;
    if (userId !== req.user.userId && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    
    const { rows } = await pool.query(
      `UPDATE profiles SET ${setClause} WHERE id = $1 RETURNING *`,
      [userId, ...values]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Загрузить фото профиля (требует JWT авторизации)
app.post('/api/profiles/:id/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Проверяем что пользователь может загружать фото только своего профиля
    // (или админ может любой)
    const userId = req.params.id;
    if (userId !== req.user.userId && !req.user.is_admin) {
      return res.status(403).json({ error: 'You can only upload photo for your own profile' });
    }
    
    const photoUrl = `/uploads/${req.file.filename}`;
    
    const { rows } = await pool.query(
      'UPDATE profiles SET profile_photo = $1 WHERE id = $2 RETURNING *',
      [photoUrl, userId]
    );
    
    res.json({ success: true, photoUrl, profile: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TEAMS API =====

// Получить все команды (с опциональным поиском)
app.get('/api/teams', async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = 'SELECT * FROM teams';
    const params = [];
    const conditions = [];
    
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    
    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить команды пользователя
app.get('/api/teams/user/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.* FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = $1`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать команду
app.post('/api/teams', async (req, res) => {
  try {
    const { name, description, category, owner_id } = req.body;
    const teamId = generateId();
    
    const { rows } = await pool.query(
      'INSERT INTO teams (id, name, description, category, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [teamId, name, description, category, owner_id]
    );
    
    // Добавляем создателя как участника
    await pool.query(
      'INSERT INTO team_members (id, team_id, user_id, role, status) VALUES ($1, $2, $3, $4, $5)',
      [generateId(), teamId, owner_id, 'owner', 'accepted']
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Удалить команду
app.delete('/api/teams/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== APPLICATIONS API =====

// Создать заявку
app.post('/api/applications', async (req, res) => {
  try {
    const { team_id, user_id, message } = req.body;
    const appId = generateId();
    
    const { rows } = await pool.query(
      'INSERT INTO applications (id, team_id, user_id, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [appId, team_id, user_id, message, 'pending']
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заявки на команду
app.get('/api/applications/team/:teamId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.first_name, p.last_name, p.role, p.interests 
       FROM applications a 
       JOIN profiles p ON a.user_id = p.id 
       WHERE a.team_id = $1`,
      [req.params.teamId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все заявки для владельца (все его команды)
app.get('/api/applications/owner/:ownerId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.first_name, p.last_name, p.role, p.interests, t.name as team_name, t.id as team_id
       FROM applications a 
       JOIN profiles p ON a.user_id = p.id 
       JOIN teams t ON a.team_id = t.id
       WHERE t.owner_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.ownerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заявки пользователя (отправителя)
app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, t.name as team_name, t.category as team_category
       FROM applications a 
       JOIN teams t ON a.team_id = t.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить статус заявки
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MESSAGES API =====

// Получить сообщения команды (с пагинацией)
app.get('/api/messages/:teamId', async (req, res) => {
  try {
    const { limit = 50, offset = 0, channel_type = 'team' } = req.query;
    
    const { rows } = await pool.query(
      `SELECT m.*, p.first_name, p.last_name 
       FROM messages m 
       JOIN profiles p ON m.user_id = p.id 
       WHERE m.team_id = $1 AND m.channel_type = $2
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.params.teamId, channel_type, limit, offset]
    );
    res.json(rows.reverse()); // Возвращаем в хронологическом порядке
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Отправить сообщение
app.post('/api/messages', async (req, res) => {
  try {
    const { team_id, user_id, content, channel_type = 'team' } = req.body;
    const msgId = generateId();
    
    const { rows } = await pool.query(
      'INSERT INTO messages (id, team_id, user_id, content, channel_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [msgId, team_id, user_id, content, channel_type]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить общие сообщения (general chat)
app.get('/api/messages/general/:channel', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { channel } = req.params;
    
    const { rows } = await pool.query(
      `SELECT m.*, p.first_name, p.last_name 
       FROM messages m 
       JOIN profiles p ON m.user_id = p.id 
       WHERE m.channel_type = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [channel, limit, offset]
    );
    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AI API =====

// AI анализ профиля
app.post('/api/ai/profile/analyze', async (req, res) => {
  const profile = req.body.profile;
  const suggestions = [
    { type: 'success', icon: '🎯', title: 'Профиль активен', text: 'Твой профиль виден другим студентам' },
    { type: 'tip', icon: '💡', title: 'Развивай навыки', text: `Добавь больше технологий в ${profile.role || 'свою область'}` },
    { type: 'tip', icon: '📝', title: 'Заполни портфолио', text: 'GitHub с проектами увеличит шансы на хакатонах' }
  ];
  res.json({ suggestions });
});

// Генерация био
app.post('/api/ai/profile/generate-bio', async (req, res) => {
  const p = req.body;
  const bio = `${p.firstName || p.first_name} — ${p.role || 'разработчик'} с интересом к ${(p.interests || []).slice(0, 2).join(', ') || 'новым технологиям'}. Участвует в хакатонах и открыт к сотрудничеству.`;
  res.json({ bio });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== ADMIN API =====

// Admin login with JWT
app.post('/api/admin/login', async (req, res) => {
  console.log('Admin login attempt:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const passwordHash = hashPassword(password);
    console.log('Looking for admin:', email);
    
    const { rows } = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE email = $1 AND password_hash = $2 AND is_admin = TRUE',
      [email, passwordHash]
    );
    
    console.log('Found users:', rows.length);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    const user = rows[0];
    console.log('Generating tokens for:', user.id);
    
    // Генерируем JWT токены для админа
    const { accessToken, refreshToken } = generateTokens(user);
    console.log('Tokens generated');
    
    // Сохраняем refresh token
    await pool.query(
      'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [refreshToken, user.id]
    );
    console.log('Refresh token saved');
    
    res.json({ 
      success: true, 
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить все хакатоны (доступно всем)
app.get('/api/hackathons', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM hackathons ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать хакатон (только админ)
app.post('/api/hackathons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;
    
    const hackathonId = generateId();
    const { rows } = await pool.query(
      `INSERT INTO hackathons (
        id, title, description, full_description, start_date, end_date, registration_deadline,
        status, format, location, max_teams, team_size, prize_fund, prize_description,
        requirements, target_audience, difficulty_level, technologies,
        organizer_name, organizer_contact, website_url, image_url, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [
        hackathonId, data.title, data.description, data.full_description || null,
        data.start_date, data.end_date, data.registration_deadline || null,
        data.status || 'upcoming', data.format || 'offline', data.location || null,
        data.max_teams || 50, data.team_size || '3-5', data.prize_fund || null,
        data.prize_description || null, data.requirements || null, data.target_audience || null,
        data.difficulty_level || 'intermediate', data.technologies || [],
        data.organizer_name || null, data.organizer_contact || null,
        data.website_url || null, data.image_url || null, userId
      ]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить хакатон (только админ)
app.put('/api/hackathons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const data = req.body;
    
    const { rows } = await pool.query(
      `UPDATE hackathons SET
        title = $1, description = $2, full_description = $3, start_date = $4, end_date = $5,
        registration_deadline = $6, status = $7, format = $8, location = $9, max_teams = $10,
        team_size = $11, prize_fund = $12, prize_description = $13, requirements = $14,
        target_audience = $15, difficulty_level = $16, technologies = $17,
        organizer_name = $18, organizer_contact = $19, website_url = $20, image_url = $21
      WHERE id = $22 RETURNING *`,
      [
        data.title, data.description, data.full_description || null,
        data.start_date, data.end_date, data.registration_deadline || null,
        data.status || 'upcoming', data.format || 'offline', data.location || null,
        data.max_teams || 50, data.team_size || '3-5', data.prize_fund || null,
        data.prize_description || null, data.requirements || null, data.target_audience || null,
        data.difficulty_level || 'intermediate', data.technologies || [],
        data.organizer_name || null, data.organizer_contact || null,
        data.website_url || null, data.image_url || null, hackathonId
      ]
    );
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить хакатон (только админ)
app.delete('/api/hackathons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hackathonId = req.params.id;
    
    await pool.query('DELETE FROM hackathons WHERE id = $1', [hackathonId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить статистику (только админ)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM hackathons) as total_hackathons,
        (SELECT COUNT(*) FROM applications WHERE status = 'pending') as pending_applications
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Демо-данные для хакатона
async function seedDemoData() {
  try {
    // Проверяем есть ли уже команды
    const { rows } = await pool.query('SELECT COUNT(*) FROM teams');
    if (parseInt(rows[0].count) > 0) return;
    
    console.log('🌱 Creating demo data...');
    
    // Демо команды
    const demoTeams = [
      {
        id: generateId(),
        name: 'AI Startup Challenge',
        description: 'Разрабатываем AI-ассистента для студентов. Ищем разработчиков с опытом в ML и NLP.',
        category: 'hackathon',
        owner_id: 'demo_owner_1'
      },
      {
        id: generateId(),
        name: 'EcoTrack App',
        description: 'Мобильное приложение для отслеживания углеродного следа. Flutter + Firebase.',
        category: 'project',
        owner_id: 'demo_owner_2'
      },
      {
        id: generateId(),
        name: 'CodeSync Platform',
        description: 'Платформа для совместного программирования в реальном времени. WebRTC + Node.js',
        category: 'startup',
        owner_id: 'demo_owner_3'
      },
      {
        id: generateId(),
        name: 'Digital KBTU',
        description: 'Улучшение цифровой инфраструктуры университета. Open Source проект.',
        category: 'pet',
        owner_id: 'demo_owner_4'
      }
    ];
    
    for (const team of demoTeams) {
      await pool.query(
        'INSERT INTO teams (id, name, description, category, owner_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [team.id, team.name, team.description, team.category, team.owner_id]
      );
    }
    
    console.log('✅ Demo data created');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

// Создание админ-пользователя при старте
async function seedAdminUser() {
  try {
    // Проверяем есть ли уже админ
    const { rows } = await pool.query('SELECT id FROM users WHERE is_admin = TRUE LIMIT 1');
    if (rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Создаем админа с дефолтными credentials
    const adminId = generateId();
    const adminEmail = 'admin@inuni.com';
    const adminPassword = 'admin123';
    const passwordHash = hashPassword(adminPassword);
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash, is_admin) VALUES ($1, $2, $3, TRUE)',
      [adminId, adminEmail, passwordHash]
    );
    
    // Создаем профиль админа
    await pool.query(
      'INSERT INTO profiles (id, first_name, last_name, email, role, course, interests) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [adminId, 'Admin', 'InUni', adminEmail, 'System Administrator', 'Admin', ['Management', 'System Admin']]
    );
    
    console.log('✅ Admin user created:');
    console.log('   Email: admin@inuni.com');
    console.log('   Password: admin123');
  } catch (err) {
    console.error('Admin seed error:', err);
  }
}

// Создание демо-хакатонов
async function seedHackathons() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM hackathons');
    if (parseInt(rows[0].count) > 0) return;
    
    console.log('🌱 Creating demo hackathons...');
    
    const demoHackathons = [
      {
        id: generateId(),
        title: 'AI Challenge 2025',
        description: 'Хакатон по разработке AI-решений для образования. Призы от 100 000 ₸ до 500 000 ₸.',
        start_date: '2025-06-15',
        end_date: '2025-06-17',
        status: 'upcoming',
        max_teams: 30
      },
      {
        id: generateId(),
        title: 'Green Tech Hackathon',
        description: 'Разработка экологичных технологических решений. Фокус на sustainability.',
        start_date: '2025-07-01',
        end_date: '2025-07-03',
        status: 'upcoming',
        max_teams: 25
      },
      {
        id: generateId(),
        title: 'Fintech Revolution',
        description: 'Инновации в финансовых технологиях. Mobile banking, crypto, DeFi.',
        start_date: '2025-05-10',
        end_date: '2025-05-12',
        status: 'completed',
        max_teams: 40
      }
    ];
    
    for (const hackathon of demoHackathons) {
      await pool.query(
        'INSERT INTO hackathons (id, title, description, start_date, end_date, status, max_teams) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [hackathon.id, hackathon.title, hackathon.description, hackathon.start_date, hackathon.end_date, hackathon.status, hackathon.max_teams]
      );
    }
    
    console.log('✅ Demo hackathons created');
  } catch (err) {
    console.error('Hackathon seed error:', err);
  }
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  await initDB();
  await seedAdminUser();
  await seedDemoData();
  await seedHackathons();
  console.log(`🚀 Server running on port ${PORT}`);
});
