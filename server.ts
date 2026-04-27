import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'tpc_group.db'));

// Assicurati che la cartella uploads esista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurazione Multer per caricamento file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Inizializzazione Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    internalCode TEXT,
    category TEXT,
    brand TEXT,
    price REAL,
    condition TEXT DEFAULT 'Nuovo',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`);

// Migrazione veloce se mancano colonne o inserimento dati iniziali
try {
  const columns = db.prepare("PRAGMA table_info(products)").all();
  const columnNames = columns.map((cl: any) => cl.name);
  
  if (!columnNames.includes('condition')) {
    db.exec(`ALTER TABLE products ADD COLUMN condition TEXT DEFAULT 'Nuovo'`);
  }

  // Aggiungi alcune categorie di esempio se vuote
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as any;
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
    ['Cottura', 'Refrigerazione', 'Lavaggio', 'Preparazione', 'Arredamento'].forEach(c => insertCat.run(c));
  }
} catch (e) {
  console.error('Errore durante migrazione/setup:', e);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  console.log('--- Avvio TPC Group Backend ---');
  console.log(`Porta configurata: ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Necessario se sei dietro Apache/Nginx per gestire correttamente le sessioni su HTTPS
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(uploadDir));
  app.use(session({
    secret: 'tpc-group-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // true se usi HTTPS in produzione
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    }
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
  // ... (nel mezzo del file, dopo le rotte dei prodotti)

  // --- API CATEGORIE ---
  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    try {
      const { name } = req.body;
      const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: 'Categoria già esistente o nome non valido' });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- API MARCHI ---
  app.get('/api/brands', (req, res) => {
    const brands = db.prepare('SELECT * FROM brands ORDER BY name ASC').all();
    res.json(brands);
  });

  app.post('/api/brands', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    try {
      const { name } = req.body;
      const info = db.prepare('INSERT INTO brands (name) VALUES (?)').run(name);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: 'Marchio già esistente o nome non valido' });
    }
  });

  app.delete('/api/brands/:id', (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/products', (req, res) => {
    try {
      const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();
      const productsWithImages = products.map((p: any) => {
        const images = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(p.id);
        return { 
          ...p, 
          images: images.map((img: any) => img.imageUrl),
          imageUrl: images.length > 0 ? images[0].imageUrl : null
        };
      });
      res.json(productsWithImages);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    try {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
      if (!product) return res.status(404).json({ message: 'Prodotto non trovato' });
      
      const images = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(req.params.id);
      res.json({
        ...product,
        images: images.map((img: any) => img.imageUrl)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/products', upload.array('images', 10), (req, res) => {
    if (!(req.session as any).isAdmin) return res.status(403).send('Forbidden');
    
    try {
      console.log('--- Richiesta Creazione Prodotto ---');
      console.log('Headers:', req.headers['content-type']);
      console.log('Body raw:', req.body);
      
      // Con multer, req.body dovrebbe essere popolato
      const title = req.body.title ? String(req.body.title).trim() : null;
      const description = req.body.description ? String(req.body.description).trim() : '';
      const internalCode = req.body.internalCode ? String(req.body.internalCode).trim() : '';
      const category = req.body.category ? String(req.body.category).trim() : '';
      const brand = req.body.brand ? String(req.body.brand).trim() : '';
      const price = parseFloat(req.body.price) || 0;
      const condition = req.body.condition ? String(req.body.condition).trim() : 'Nuovo';
      
      if (!title) {
        console.error('ERRORE: Titolo mancante in req.body');
        return res.status(400).json({ error: 'Il titolo è obbligatorio' });
      }

      console.log('Dati validati:', { title, internalCode, category, brand, price, condition });

      const files = req.files as Express.Multer.File[];
      console.log('Numero file caricati:', files ? files.length : 0);
      
      const info = db.prepare('INSERT INTO products (title, description, internalCode, category, brand, price, condition) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        title, 
        description, 
        internalCode, 
        category, 
        brand, 
        price, 
        condition
      );
      
      const productId = info.lastInsertRowid;
      console.log('Prodotto creato con successo. ID:', productId);
      
      if (files && files.length > 0) {
        const insertImg = db.prepare('INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)');
        for (const file of files) {
          const imgUrl = `/uploads/${file.filename}`;
          insertImg.run(productId, imgUrl);
          console.log('Immagine associata:', imgUrl);
        }
      }
      
      res.json({ id: productId, success: true });
    } catch (error: any) {
      console.error('SERVER FATAL ERROR (POST /api/products):', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
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

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
  });
}

startServer();
