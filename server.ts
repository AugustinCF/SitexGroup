import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware per parsing JSON
  app.use(express.json());

  // --- ESEMPIO ROTTE API ---
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend Node.js è attivo!' });
  });

  // Esempio rotta per ricevere messaggi dal form contatti
  app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Nuovo messaggio ricevuto:', { name, email, message });
    
    // Qui potresti inviare una email reale usando nodemailer
    res.json({ success: true, message: 'Messaggio ricevuto con successo!' });
  });

  // --- CONFIGURAZIONE VITE ---

  if (process.env.NODE_ENV !== 'production') {
    // In sviluppo, usiamo il middleware di Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In produzione, serviamo i file statici dalla cartella dist
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
