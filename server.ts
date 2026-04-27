import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import session from 'express-session';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('tpc_group.db');

// Inizializzazione Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    internalCode TEXT,
    imageUrl TEXT,
    category TEXT,
    brand TEXT,
    price REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    secret: 'tpc-group-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Impostare a true se usi HTTPS
  }));

  // --- API AUTH ---
  
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    // Definiamo una password admin semplice per ora
    if (password === 'admin123') {
      (req.session as any).isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Password errata' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/check-auth', (req, res) => {
    res.json({ isAdmin: !!(req.session as any).isAdmin });
  });

  // --- API PRODOTTI ---

  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    const { title, description, internalCode, imageUrl, category, brand, price } = req.body;
    const info = db.prepare('INSERT INTO products (title, description, internalCode, imageUrl, category, brand, price) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      title, description, internalCode, imageUrl, category, brand, price
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/products/:id', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- ALTRE API ---
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/contact', (req, res) => {
    console.log('Messaggio contatti:', req.body);
    res.json({ success: true });
  });

  // --- CONFIGURAZIONE VITE / PRODUZIONE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
  });
}

startServer();
