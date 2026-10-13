const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const sqlite3 = sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: Necesario para que Render (y otros proxies) manejen cookies seguras correctamente
app.set('trust proxy', 1);

// Configuración de la Base de Datos SQLite
const dbFile = path.join(__dirname, 'data', 'database.sqlite');
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('Error al conectar con SQLite:', err.message);
    else console.log('Conectado a la base de datos SQLite.');
});

// Crear tablas si no existen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER,
        lesson_id INTEGER,
        completed INTEGER DEFAULT 1,
        PRIMARY KEY (user_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Sesiones
app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './data' }),
    secret: process.env.SESSION_SECRET || 'cyberlearn_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true en Render (HTTPS)
        httpOnly: true,
        sameSite: 'lax', // Recomendado para evitar bloqueos de cookies en navegadores modernos
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
    }
}));

// --- RUTAS API DE AUTENTICACIÓN ---
// (El resto de tus rutas de registro, login, sesión, logout y progreso se mantienen exactamente igual)
