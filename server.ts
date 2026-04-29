import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
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
const prisma = new PrismaClient();

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

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  
  app.set('trust proxy', 1); // Trust first proxy (Nginx)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Logging middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
  });

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use(session({
    secret: 'tpc-group-secret-key-v2',
    resave: true,
    saveUninitialized: true,
    name: 'sid',
    proxy: true, // Required for secure cookies behind a proxy
    cookie: { 
      secure: process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true',
      sameSite: process.env.USE_HTTPS === 'true' ? 'none' : 'lax', 
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  }));

  // Helper per Admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.session && req.session.isAdmin) {
      next();
    } else {
      console.log(`[AUTH] Unauthorized access attempt to ${req.url}. Session ID: ${req.sessionID}, isAdmin: ${req.session?.isAdmin}`);
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // --- AUTH ---
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`[LOGIN ATTEMPT] Provided: "${password}", Expected: "${adminPassword}"`);

    if (password === adminPassword) {
      (req.session as any).isAdmin = true;
      req.session.save((err) => {
        if (err) {
          console.error('[SESSION SAVE ERROR]', err);
          return res.status(500).json({ success: false, message: 'Errore sessione' });
        }
        console.log('[LOGIN SUCCESS] Session saved for user');
        res.json({ success: true });
      });
    } else {
      console.log('[LOGIN FAILED] Incorrect password');
      res.status(401).json({ success: false, message: 'Password errata' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get('/api/check-auth', (req, res) => {
    const isAdmin = !!(req.session as any).isAdmin;
    res.json({ isAdmin });
  });

  // --- BRANDS CRUD (already refactored in previous step, skipping to products) ---

  // NOTE: I'll include the Brands/Categories routes here again to ensure consistency if needed, 
  // but to keep the edit clean I'll target the Products section.
  app.get('/api/brands', async (req, res) => {
    try {
      console.log('[API] Fetching brands...');
      const brands = await prisma.brand.findMany({
        orderBy: { name_it: 'asc' }
      });
      res.json(brands);
    } catch (e: any) {
      console.error(`[API ERROR - GET BRANDS]`, e);
      res.status(500).json({ error: e.message, details: e.stack });
    }
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

      await prisma.brand.create({
        data: {
          name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
          slug,
          description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
          logo: logoPath, website: data.website, visibility: data.visibility === 'true',
          meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
          meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
        }
      });

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/brands/:id', isAdmin, async (req, res) => {
    try {
      await prisma.brand.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/brands/:id', isAdmin, upload.single('logo'), async (req, res) => {
    try {
      const data = req.body;
      const id = parseInt(req.params.id);
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      const updateData: any = {
        name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
        slug,
        description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
        website: data.website, visibility: data.visibility === 'true',
        meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
        meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
      };

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-brand${ext}`;
        const destPath = path.join(uploadDirs.logos, fileName);
        await sharp(req.file.path)
          .resize(800, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toFile(destPath);
        fs.unlinkSync(req.file.path);
        updateData.logo = `/uploads/logos/${fileName}`;
      }

      await prisma.brand.update({
        where: { id },
        data: updateData
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/brands/by-slug/:slug', async (req, res) => {
    try {
      const brand = await prisma.brand.findUnique({
        where: { slug: req.params.slug }
      });
      if (!brand) return res.status(404).json({ error: 'Not found' });
      res.json(brand);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- CATEGORIES CRUD ---
  app.get('/api/categories', async (req, res) => {
    try {
      console.log('[API] Fetching categories...');
      const cats = await prisma.category.findMany({
        orderBy: { name_it: 'asc' }
      });
      res.json(cats);
    } catch (e: any) {
      console.error(`[API ERROR - GET CATEGORIES]`, e);
      res.status(500).json({ error: e.message, details: e.stack });
    }
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

      await prisma.category.create({
        data: {
          name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
          slug,
          description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
          image: imgPath,
          meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
          meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
        }
      });

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/categories/:id', isAdmin, async (req, res) => {
    try {
      await prisma.category.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/categories/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
      const data = req.body;
      const id = parseInt(req.params.id);
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      const updateData: any = {
        name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
        slug,
        description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
        meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
        meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
      };

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-cat${ext}`;
        const destPath = path.join(uploadDirs.categories, fileName);
        await sharp(req.file.path).toFile(destPath);
        fs.unlinkSync(req.file.path);
        updateData.image = `/uploads/categories/${fileName}`;
      }

      await prisma.category.update({
        where: { id },
        data: updateData
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/categories/by-slug/:slug', async (req, res) => {
    try {
      const cat = await prisma.category.findUnique({
        where: { slug: req.params.slug }
      });
      if (!cat) return res.status(404).json({ error: 'Not found' });
      res.json(cat);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- PRODUCTS CRUD ---
  app.get('/api/products', async (req, res) => {
    try {
      console.log('[API] Fetching products...');
      const products = await prisma.product.findMany({
        include: {
          brand: true,
          category: true,
          images: true,
          attributes: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const results = products.map(p => ({
        ...p,
        brandName: p.brand?.name_it,
        categoryName: p.category?.name_it,
        images: p.images.map(img => img.imageUrl)
      }));
      res.json(results);
    } catch (e: any) {
      console.error(`[API ERROR - GET PRODUCTS]`, e);
      res.status(500).json({ error: e.message, details: e.stack });
    }
  });

  app.post('/api/products', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const data = req.body;
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      const product = await prisma.product.create({
        data: {
          name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
          slug,
          description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
          visibility: data.visibility === 'true',
          brandId: data.brandId ? parseInt(data.brandId) : null,
          categoryId: data.categoryId ? parseInt(data.categoryId) : null,
          price: parseFloat(data.price) || 0,
          meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
          meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
        }
      });

      const files = req.files as Express.Multer.File[];
      if (files) {
        for (const file of files) {
          const fileName = `${Date.now()}-${file.filename}`;
          const destPath = path.join(uploadDirs.products, fileName);
          await sharp(file.path).toFile(destPath);
          fs.unlinkSync(file.path);
          
          await prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: `/uploads/products/${fileName}`
            }
          });
        }
      }

      res.json({ success: true, id: product.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { 
          images: true,
          attributes: {
            orderBy: { order: 'asc' }
          }
        }
      });
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.json({ 
        ...product, 
        images: product.images.map((img: any) => img.imageUrl) 
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/products/:id', isAdmin, async (req, res) => {
    try {
      await prisma.product.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/products/:id', isAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const data = req.body;
      const id = parseInt(req.params.id);
      const slug = data.slug || slugify(data.name_it, { lower: true });
      
      await prisma.product.update({
        where: { id },
        data: {
          name_it: data.name_it, name_en: data.name_en, name_es: data.name_es, name_de: data.name_de, name_fr: data.name_fr,
          slug,
          description_it: data.description_it, description_en: data.description_en, description_es: data.description_es, description_de: data.description_de, description_fr: data.description_fr,
          visibility: data.visibility === 'true',
          brandId: data.brandId ? parseInt(data.brandId) : null,
          categoryId: data.categoryId ? parseInt(data.categoryId) : null,
          price: parseFloat(data.price) || 0,
          meta_title_it: data.meta_title_it, meta_title_en: data.meta_title_en, meta_title_es: data.meta_title_es, meta_title_de: data.meta_title_de, meta_title_fr: data.meta_title_fr,
          meta_description_it: data.meta_description_it, meta_description_en: data.meta_description_en, meta_description_es: data.meta_description_es, meta_description_de: data.meta_description_de, meta_description_fr: data.meta_description_fr
        }
      });

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = `${Date.now()}-${file.filename}`;
          const destPath = path.join(uploadDirs.products, fileName);
          await sharp(file.path).toFile(destPath);
          fs.unlinkSync(file.path);
          
          await prisma.productImage.create({
            data: {
              productId: id,
              imageUrl: `/uploads/products/${fileName}`
            }
          });
        }
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- ATTRIBUTE DEFINITIONS CRUD ---
  app.get('/api/attribute-definitions', async (req, res) => {
    try {
      console.log('[API] Fetching attribute definitions...');
      const defs = await prisma.attributeDefinition.findMany({
        orderBy: { name_it: 'asc' }
      });
      res.json(defs);
    } catch (e: any) {
      console.error(`[API ERROR - GET ATTRIBUTE-DEFINITIONS]`, e);
      res.status(500).json({ error: e.message, details: e.stack });
    }
  });

  app.post('/api/attribute-definitions', isAdmin, async (req, res) => {
    try {
      const data = req.body;
      const def = await prisma.attributeDefinition.create({
        data: {
          name_it: data.name_it,
          name_en: data.name_en,
          name_es: data.name_es,
          name_de: data.name_de,
          name_fr: data.name_fr,
        }
      });
      res.json(def);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/attribute-definitions/:id', isAdmin, async (req, res) => {
    try {
      const data = req.body;
      const def = await prisma.attributeDefinition.update({
        where: { id: parseInt(req.params.id) },
        data: {
          name_it: data.name_it,
          name_en: data.name_en,
          name_es: data.name_es,
          name_de: data.name_de,
          name_fr: data.name_fr,
        }
      });
      res.json(def);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/attribute-definitions/:id', isAdmin, async (req, res) => {
    try {
      await prisma.attributeDefinition.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- ATTRIBUTES CRUD ---
  app.get('/api/attributes', async (req, res) => {
    try {
      const attrs = await prisma.attribute.findMany({
        include: {
          definition: true,
          product: {
            select: { name_it: true, id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(attrs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/:productId/attributes', async (req, res) => {
    try {
      const attrs = await prisma.attribute.findMany({
        where: { productId: parseInt(req.params.productId) },
        include: { definition: true },
        orderBy: { order: 'asc' }
      });
      res.json(attrs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/products/:productId/attributes', isAdmin, async (req, res) => {
    try {
      const data = req.body;
      const productId = parseInt(req.params.productId);
      
      const attr = await prisma.attribute.create({
        data: {
          productId,
          attributeDefinitionId: parseInt(data.attributeDefinitionId),
          value_it: data.value_it,
          value_en: data.value_en,
          order: parseInt(data.order) || 0
        },
        include: { definition: true }
      });
      res.json(attr);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/attributes/:id', isAdmin, async (req, res) => {
    try {
      await prisma.attribute.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/attributes/:id', isAdmin, async (req, res) => {
    try {
      const data = req.body;
      const attr = await prisma.attribute.update({
        where: { id: parseInt(req.params.id) },
        data: {
          attributeDefinitionId: parseInt(data.attributeDefinitionId),
          value_it: data.value_it,
          value_en: data.value_en,
          order: parseInt(data.order) || 0
        },
        include: { definition: true }
      });
      res.json(attr);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/products/by-slug/:slug', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: req.params.slug },
        include: {
          images: true,
          brand: true,
          category: true,
          attributes: {
            include: { definition: true },
            orderBy: { order: 'asc' }
          }
        }
      });
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.json({ 
        ...product, 
        images: product.images.map((img: any) => img.imageUrl),
        brandName: product.brand?.name_it,
        categoryName: product.category?.name_it
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- BULK IMPORT ---
  app.post('/api/import', isAdmin, upload.single('csv'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    
    try {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      let delimiter = ',';
      const firstLine = fileContent.split('\n')[0];
      if (firstLine.includes(';')) delimiter = ';';
      
      const records: any[] = parse(fileContent, { 
        columns: true, 
        skip_empty_lines: true,
        delimiter: delimiter,
        trim: true,
        bom: true
      });
      
      let importedCount = 0;

      for (const row of records) {
        const name = row.name_it || row.name || row.Name;
        if (!name) continue;
        const slug = row.slug || slugify(name, { lower: true });

        if (row.type === 'product') {
          let brandId = null;
          let categoryId = null;

          if (row.brandName) {
            const brand = await prisma.brand.findFirst({
              where: { OR: [{ name_it: row.brandName }, { slug: slugify(row.brandName, { lower: true }) }] }
            });
            if (brand) brandId = brand.id;
          }

          if (row.categoryName) {
            const cat = await prisma.category.findFirst({
              where: { OR: [{ name_it: row.categoryName }, { slug: slugify(row.categoryName, { lower: true }) }] }
            });
            if (cat) categoryId = cat.id;
          }

          const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
              name_it: name,
              slug,
              description_it: row.description_it || '',
              price: parseFloat(row.price) || 0,
              brandId,
              categoryId,
              visibility: true
            }
          });
          
          importedCount++;

          if (row.imageUrls) {
            const urls = row.imageUrls.split(',');
            for (let url of urls) {
              url = url.trim();
              try {
                const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
                const fileName = `${Date.now()}-${Math.round(Math.random()*1000)}.jpg`;
                const destPath = path.join(uploadDirs.products, fileName);
                await sharp(imgRes.data).toFile(destPath);
                
                await prisma.productImage.create({
                  data: {
                    productId: product.id,
                    imageUrl: `/uploads/products/${fileName}`
                  }
                });
              } catch (err) {
                console.error('Errore download immagine prodotto:', url);
              }
            }
          }
        } else if (row.type === 'brand') {
          let logoPath = '';
          const url = (row.logoUrl || row.logo)?.trim();
          if (url) {
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

          await prisma.brand.upsert({
            where: { slug },
            update: {},
            create: {
              name_it: name,
              slug,
              description_it: row.description_it || '',
              website: row.website || row.Website || '',
              logo: logoPath,
              visibility: true
            }
          });
          importedCount++;
        } else if (row.type === 'category') {
          let imgPath = '';
          const url = (row.imageUrl || row.image)?.trim();
          if (url) {
            try {
              const imgRes = await axios.get(url, { responseType: 'arraybuffer' });
              const fileName = `${Date.now()}-cat-${Math.round(Math.random()*1000)}.jpg`;
              const destPath = path.join(uploadDirs.categories, fileName);
              await sharp(imgRes.data).toFile(destPath);
              imgPath = `/uploads/categories/${fileName}`;
            } catch (err) {
              console.error('Errore download immagine categoria:', url);
            }
          }

          await prisma.category.upsert({
            where: { slug },
            update: {},
            create: {
              name_it: name,
              slug,
              description_it: row.description_it || '',
              image: imgPath
            }
          });
          importedCount++;
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
