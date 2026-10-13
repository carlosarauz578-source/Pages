const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANTE: Necesario para que Render maneje las cookies de forma segura detrás de su proxy
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
        secure: process.env.NODE_ENV === 'production', // true en producción (Render con HTTPS)
        httpOnly: true,
        sameSite: 'lax', // Evita bloqueos de cookies en navegadores modernos
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semana
    }
}));

// --- RUTAS API DE AUTENTICACIÓN ---

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 12) {
        return res.status(400).json({ error: 'Datos incompletos o contraseña menor a 12 caracteres.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
            }
            req.session.userId = this.lastID;
            req.session.userName = name;
            res.json({ success: true, message: 'Usuario registrado y sesión iniciada.' });
        });
    } catch (e) {
        res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
    }
});

// Inicio de sesión
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Proporcione correo y contraseña.' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;
        res.json({ success: true, message: 'Sesión iniciada correctamente.' });
    });
});

// Comprobar sesión activa
app.get('/api/auth/session', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, name: req.session.userName });
    } else {
        res.status(401).json({ loggedIn: false });
    }
});

// Cerrar sesión
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Sesión cerrada.' });
    });
});

// --- RUTAS API DE PROGRESO ---

// Obtener progreso del usuario actual
app.get('/api/progress', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'No autorizado' });

    db.all(`SELECT lesson_id FROM progress WHERE user_id = ?`, [req.session.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar progreso.' });
        res.json({ completedLessons: rows.map(r => r.lesson_id) });
    });
});

// Guardar/Actualizar progreso de una lección
app.post('/api/progress', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'No autorizado' });
    const { lessonId, completed } = req.body;

    if (completed) {
        db.run(`INSERT OR IGNORE INTO progress (user_id, lesson_id, completed) VALUES (?, ?, 1)`, [req.session.userId, lessonId], (err) => {
            if (err) return res.status(500).json({ error: 'Error al guardar progreso.' });
            res.json({ success: true });
        });
    } else {
        db.run(`DELETE FROM progress WHERE user_id = ? AND lesson_id = ?`, [req.session.userId, lessonId], (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar progreso.' });
            res.json({ success: true });
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
