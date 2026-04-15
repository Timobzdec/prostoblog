require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://prostoblog.site',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // для локальной разработки, в продакшене true с HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 часа
  }
}));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Отдача SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});