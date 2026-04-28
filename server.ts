import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';
import sharp from 'sharp';
import slugify from 'slugify';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'tpc_group.db'));

// Directories per i caricamenti
const uploadDirs = {
  logos: path.join(__dirname, 'uploads/logos'),
  categories: path.join(__dirname, 'uploads/categories'),
  products: path.join(__dirname, 'uploads/products'),
  temp: path.join(__dirname, 'uploads/temp')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configurazione Multer generica
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.temp);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Inizializzazione Database con nuovo schema
db.exec(`
  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_it TEXT, name_en TEXT, name_es TEXT, name_de TEXT, name_fr TEXT,
    slug TEXT UNIQUE,
    description_it TEXT, description_en TEXT, description_es TEXT, description_de TEXT, description_fr TEXT,
    logo TEXT,
    website TEXT,
    visibility BOOLEAN DEFAULT 1,
    meta_title_it TEXT, meta_title_en TEXT, meta_title_es TEXT, meta_title_de TEXT, meta_title_fr TEXT,
    meta_description_it TEXT, meta_description_en TEXT, meta_description_es TEXT, meta_description_de TEXT, meta_description_fr TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_it TEXT, name_en TEXT, name_es TEXT, name_de TEXT, name_fr TEXT,
    slug TEXT UNIQUE,
    description_it TEXT, description_en TEXT, description_es TEXT, description_de TEXT, description_fr TEXT,
    image TEXT,
    meta_title_it TEXT, meta_title_en TEXT, meta_title_es TEXT, meta_title_de TEXT, meta_title_fr TEXT,
    meta_description_it TEXT, meta_description_en TEXT, meta_description_es TEXT, meta_description_de TEXT, meta_description_fr TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_it TEXT, name_en TEXT, name_es TEXT, name_de TEXT, name_fr TEXT,
    slug TEXT UNIQUE,
    description_it TEXT, description_en TEXT, description_es TEXT, description_de TEXT, description_fr TEXT,
    visibility BOOLEAN DEFAULT 1,
    brandId INTEGER,
    categoryId INTEGER,
    price REAL,
    meta_title_it TEXT, meta_title_en TEXT, meta_title_es TEXT, meta_title_de TEXT, meta_title_fr TEXT,
    meta_description_it TEXT, meta_description_en TEXT, meta_description_es TEXT, meta_description_de TEXT, meta_description_fr TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use(session({
    secret: 'tpc-group-secret-key-v2',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production' && !process.env.IS_LOCAL,
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // Helper per Admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.session && req.session.isAdmin) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // --- AUTH ---
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    console.log(`Login attempt with password length: ${password?.length || 0}`);
    if (password === adminPassword) {
      (req.session as any).isAdmin = true;
      console.log(`Login successful for SessionID=${req.sessionID}`);
      res.json({ success: true });
    } else {
      console.log(`Login failed for SessionID=${req.sessionID}`);
      res.status(401).json({ success: false, message: 'Password errata' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get('/api/check-auth', (req, res) => {
    const isAdmin = !!(req.session as any).isAdmin;
    console.log(`Check Auth: isAdmin=${isAdmin}, SessionID=${req.sessionID}`);
    res.json({ isAdmin });
  });

  // --- BRANDS CRUD ---
  app.get('/api/brands', (req, res) => {
    const brands = db.prepare('SELECT * FROM brands ORDER BY name_it ASC').all();
    res.json(brands);
  });

  app.post('/api/brands', isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const data = req.body;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      let logoPath = '';

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-brand${ext}`;
        const destPath = path.join(uploadDirs.logos, fileName);
        
        await sharp(req.file.path)
          .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toFile(destPath);
        
        fs.unlinkSync(req.file.path);
        logoPath = `/uploads/logos/${fileName}`;
      }

      const stmt = db.prepare(`
        INSERT INTO brands (
          name_it, name_en, name_es, name_de, name_fr, slug, description_it, description_en, description_es, description_de, description_fr,
          logo, website, visibility, meta_title_it, meta_title_en, meta_title_es, meta_title_de, meta_title_fr,
          meta_description_it, meta_description_en, meta_description_es, meta_description_de, meta_description_fr
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);
      
      stmt.run(
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        logoPath, data.website, data.visibility === 'true' ? 1 : 0,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr
      );

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/brands/:id', isAdmin, (req, res) => {
    db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/brands/:id', isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const data = req.body;
      const id = req.params.id;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      let updateQuery = `
        UPDATE brands SET 
          name_it=?, name_en=?, name_es=?, name_de=?, name_fr=?, 
          slug=?, 
          description_it=?, description_en=?, description_es=?, description_de=?, description_fr=?,
          website=?, visibility=?, 
          meta_title_it=?, meta_title_en=?, meta_title_es=?, meta_title_de=?, meta_title_fr=?,
          meta_description_it=?, meta_description_en=?, meta_description_es=?, meta_description_de=?, meta_description_fr=?
      `;
      let params = [
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        data.website, data.visibility === 'true' ? 1 : 0,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr
      ];

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-brand${ext}`;
        const destPath = path.join(uploadDirs.logos, fileName);
        await sharp(req.file.path)
          .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toFile(destPath);
        fs.unlinkSync(req.file.path);
        updateQuery += `, logo=?`;
        params.push(`/uploads/logos/${fileName}`);
      }

      updateQuery += ` WHERE id=?`;
      params.push(id);

      db.prepare(updateQuery).run(...params);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/brands/by-slug/:slug', (req, res) => {
    const brand = db.prepare('SELECT * FROM brands WHERE slug = ?').get(req.params.slug);
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  });

  // --- CATEGORIES CRUD ---
  app.get('/api/categories', (req, res) => {
    const cats = db.prepare('SELECT * FROM categories ORDER BY name_it ASC').all();
    res.json(cats);
  });

  app.post('/api/categories', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const data = req.body;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      let imgPath = '';

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-cat${ext}`;
        const destPath = path.join(uploadDirs.categories, fileName);
        
        await sharp(req.file.path).toFile(destPath);
        fs.unlinkSync(req.file.path);
        imgPath = `/uploads/categories/${fileName}`;
      }

      const stmt = db.prepare(`
        INSERT INTO categories (
          name_it, name_en, name_es, name_de, name_fr, slug, description_it, description_en, description_es, description_de, description_fr,
          image, meta_title_it, meta_title_en, meta_title_es, meta_title_de, meta_title_fr,
          meta_description_it, meta_description_en, meta_description_es, meta_description_de, meta_description_fr
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);

      stmt.run(
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        imgPath,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr
      );

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/categories/:id', isAdmin, (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/categories/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const data = req.body;
      const id = req.params.id;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      let updateQuery = `
        UPDATE categories SET 
          name_it=?, name_en=?, name_es=?, name_de=?, name_fr=?, 
          slug=?, 
          description_it=?, description_en=?, description_es=?, description_de=?, description_fr=?,
          meta_title_it=?, meta_title_en=?, meta_title_es=?, meta_title_de=?, meta_title_fr=?,
          meta_description_it=?, meta_description_en=?, meta_description_es=?, meta_description_de=?, meta_description_fr=?
      `;
      let params = [
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr
      ];

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-cat${ext}`;
        const destPath = path.join(uploadDirs.categories, fileName);
        await sharp(req.file.path).toFile(destPath);
        fs.unlinkSync(req.file.path);
        updateQuery += `, image=?`;
        params.push(`/uploads/categories/${fileName}`);
      }

      updateQuery += ` WHERE id=?`;
      params.push(id);

      db.prepare(updateQuery).run(...params);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/categories/by-slug/:slug', (req, res) => {
    const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    res.json(cat);
  });

  // --- PRODUCTS CRUD ---
  app.get('/api/products', (req, res) => {
    const products = db.prepare(`
      SELECT p.*, b.name_it as brandName, c.name_it as categoryName 
      FROM products p 
      LEFT JOIN brands b ON p.brandId = b.id 
      LEFT JOIN categories c ON p.categoryId = c.id
      ORDER BY p.createdAt DESC
    `).all();
    
    const results = products.map((p: any) => {
      const images = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(p.id);
      return { ...p, images: images.map((img: any) => img.imageUrl) };
    });
    res.json(results);
  });

  app.post('/api/products', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const data = req.body;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      const stmt = db.prepare(`
        INSERT INTO products (
          name_it, name_en, name_es, name_de, name_fr, slug, description_it, description_en, description_es, description_de, description_fr,
          visibility, brandId, categoryId, price, meta_title_it, meta_title_en, meta_title_es, meta_title_de, meta_title_fr,
          meta_description_it, meta_description_en, meta_description_es, meta_description_de, meta_description_fr
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);

      const info = stmt.run(
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        data.visibility === 'true' ? 1 : 0,
        data.brandId || null,
        data.categoryId || null,
        parseFloat(data.price) || 0,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr
      );

      const productId = info.lastInsertRowid;
      const files = req.files as Express.Multer.File[];
      if (files) {
        const insertImg = db.prepare('INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)');
        for (const file of files) {
          const fileName = `${Date.now()}-${file.filename}`;
          const destPath = path.join(uploadDirs.products, fileName);
          await sharp(file.path).toFile(destPath);
          fs.unlinkSync(file.path);
          insertImg.run(productId, `/uploads/products/${fileName}`);
        }
      }

      res.json({ success: true, id: productId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/:id', (req, res) => {
    const product: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    const images: any = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(product.id);
    res.json({ ...product, images: images.map((img: any) => img.imageUrl) });
  });

  app.delete('/api/products/:id', isAdmin, (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/products/:id', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const data = req.body;
      const id = req.params.id;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      let updateQuery = `
        UPDATE products SET 
          name_it=?, name_en=?, name_es=?, name_de=?, name_fr=?, 
          slug=?, 
          description_it=?, description_en=?, description_es=?, description_de=?, description_fr=?,
          visibility=?, brandId=?, categoryId=?, price=?,
          meta_title_it=?, meta_title_en=?, meta_title_es=?, meta_title_de=?, meta_title_fr=?,
          meta_description_it=?, meta_description_en=?, meta_description_es=?, meta_description_de=?, meta_description_fr=?
        WHERE id=?
      `;
      let params = [
        data.name_it, data.name_en, data.name_es, data.name_de, data.name_fr,
        slug,
        data.description_it, data.description_en, data.description_es, data.description_de, data.description_fr,
        data.visibility === 'true' ? 1 : 0,
        data.brandId || null,
        data.categoryId || null,
        parseFloat(data.price) || 0,
        data.meta_title_it, data.meta_title_en, data.meta_title_es, data.meta_title_de, data.meta_title_fr,
        data.meta_description_it, data.meta_description_en, data.meta_description_es, data.meta_description_de, data.meta_description_fr,
        id
      ];

      db.prepare(updateQuery).run(...params);

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const insertImg = db.prepare('INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)');
        for (const file of files) {
          const fileName = `${Date.now()}-${file.filename}`;
          const destPath = path.join(uploadDirs.products, fileName);
          await sharp(file.path).toFile(destPath);
          fs.unlinkSync(file.path);
          insertImg.run(id, `/uploads/products/${fileName}`);
        }
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/by-slug/:slug', (req, res) => {
    const product: any = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Not found' });
    const images: any = db.prepare('SELECT imageUrl FROM product_images WHERE productId = ?').all(product.id);
    res.json({ ...product, images: images.map((img: any) => img.imageUrl) });
  });

  // --- BULK IMPORT ---
  app.post('/api/import', isAdmin, upload.single('csv'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    
    try {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const records: any[] = parse(fileContent, { columns: true, skip_empty_lines: true });
      
      let importedCount = 0;

      for (const row of records) {
        if (row.type === 'product') {
          const slug = row.slug || slugify(row.name_it, { lower: true });
          
          // Lookup brandId and categoryId if names are provided
          let brandId = null;
          let categoryId = null;

          if (row.brandName) {
            const brand = db.prepare('SELECT id FROM brands WHERE name_it = ? OR slug = ?').get(row.brandName, slugify(row.brandName, { lower: true }));
            if (brand) brandId = (brand as any).id;
          }

          if (row.categoryName) {
            const cat = db.prepare('SELECT id FROM categories WHERE name_it = ? OR slug = ?').get(row.categoryName, slugify(row.categoryName, { lower: true }));
            if (cat) categoryId = (cat as any).id;
          }

          const stmt = db.prepare('INSERT OR IGNORE INTO products (name_it, slug, description_it, price, brandId, categoryId) VALUES (?, ?, ?, ?, ?, ?)');
          const info = stmt.run(row.name_it, slug, row.description_it, parseFloat(row.price) || 0, brandId, categoryId);
          
          if (info.changes > 0) {
            importedCount++;
            if (row.imageUrls) {
              const pId = info.lastInsertRowid;
              const urls = row.imageUrls.split(',');
              const insertImg = db.prepare('INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)');
              for (let url of urls) {
                url = url.trim();
                try {
                  const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
                  const fileName = `${Date.now()}-${Math.round(Math.random()*1000)}.jpg`;
                  const destPath = path.join(uploadDirs.products, fileName);
                  await sharp(imgRes.data).toFile(destPath);
                  insertImg.run(pId, `/uploads/products/${fileName}`);
                } catch (err) {
                  console.error('Errore download immagine prodotto:', url);
                }
              }
            }
          }
        } else if (row.type === 'brand') {
          const name = row.name_it || row.name || row.Name;
          if (!name) {
            console.log('Skipping brand import: name missing', row);
            continue;
          }
          const slug = row.slug || slugify(name, { lower: true });
          let logoPath = '';

          if (row.logoUrl || row.logo) {
            const url = (row.logoUrl || row.logo).trim();
            try {
              const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
              const fileName = `${Date.now()}-brand-${Math.round(Math.random()*1000)}.jpg`;
              const destPath = path.join(uploadDirs.logos, fileName);
              await sharp(imgRes.data)
                .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .toFile(destPath);
              logoPath = `/uploads/logos/${fileName}`;
            } catch (err) {
              console.error('Errore download logo brand:', url, err);
            }
          }

          const description = row.description_it || row.description || row.Description || '';
          const website = row.website || row.Website || '';

          const stmt = db.prepare('INSERT OR IGNORE INTO brands (name_it, slug, description_it, website, logo, visibility) VALUES (?, ?, ?, ?, ?, 1)');
          const info = stmt.run(name, slug, description, website, logoPath);
          if (info.changes > 0) {
            importedCount++;
            console.log(`Brand imported: ${name} (slug: ${slug})`);
          } else {
            console.warn(`Brand skipped (likely duplicate slug or name): ${name} (slug: ${slug})`);
          }
        } else if (row.type === 'category') {
          const name = row.name_it || row.name || row.Name;
          if (!name) {
            console.log('Skipping category import: name missing', row);
            continue;
          }
          const slug = row.slug || slugify(name, { lower: true });
          let imgPath = '';

          if (row.imageUrl || row.image) {
            const url = (row.imageUrl || row.image).trim();
            try {
              const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
              const fileName = `${Date.now()}-cat-${Math.round(Math.random()*1000)}.jpg`;
              const destPath = path.join(uploadDirs.categories, fileName);
              await sharp(imgRes.data).toFile(destPath);
              imgPath = `/uploads/categories/${fileName}`;
            } catch (err) {
              console.error('Errore download immagine categoria:', row.imageUrl);
            }
          }

          const stmt = db.prepare('INSERT OR IGNORE INTO categories (name_it, slug, description_it, image) VALUES (?, ?, ?, ?, ?)');
          const info = stmt.run(row.name_it, slug, row.description_it, imgPath);
          if (info.changes > 0) importedCount++;
        }
      }
      
      fs.unlinkSync(req.file.path);
      res.json({ success: true, count: importedCount, total: records.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE ---
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
