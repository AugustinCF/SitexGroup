# Documentazione Tecnica - TPC Group App

Questa documentazione descrive l'architettura, le tecnologie e le procedure operative per l'applicazione TPC Group.

## Architettura del Sistema
L'applicazione è costruita come una Single Page Application (SPA) Full-Stack utilizzando:
- **Frontend**: React 18 con Vite, Tailwind CSS per lo styling e Framer Motion per le animazioni.
- **Backend**: Node.js con Express.
- **Database**: SQLite (tramite `better-sqlite3`) per persistenza locale dei dati.
- **Gestione Sessioni**: `express-session` per l'autenticazione amministrativa.
- **Gestione File**: `multer` per il caricamento delle immagini dei prodotti.

## Struttura del Database
Il database `tpc_group.db` contiene due tabelle principali:

### 1. `products` (Prodotti)
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | INTEGER | Chiave primaria autoincrementante |
| title | TEXT | Titolo del prodotto (Obbligatorio) |
| description | TEXT | Descrizione dettagliata |
| internalCode | TEXT | Codice identificativo interno |
| category | TEXT | Categoria (es. Cucina, Refrigerazione) |
| brand | TEXT | Marchio del prodotto |
| price | REAL | Prezzo (formato numerico) |
| condition | TEXT | Stato del prodotto ('Nuovo' o 'Usato') |
| createdAt | DATETIME | Timestamp di creazione |

### 2. `product_images` (Immagini)
| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| id | INTEGER | Chiave primaria |
| productId | INTEGER | Foreign Key verso la tabella products |
| imageUrl | TEXT | Percorso relativo dell'immagine (es. /uploads/...) |

## Endpoint API

### Autenticazione
- `POST /api/login`: Effettua il login come amministratore. Richiede una password nel body JSON.
- `POST /api/logout`: Termina la sessione corrente.
- `GET /api/check-auth`: Verifica se l'utente attuale ha i permessi di amministratore.

### Prodotti
- `GET /api/products`: Restituisce la lista di tutti i prodotti con le relative immagini.
- `GET /api/products/:id`: Restituisce i dettagli di un singolo prodotto specifico.
- `POST /api/products`: Crea un nuovo prodotto. Accetta dati in formato `multipart/form-data` inclusi i file immagini (campo `images`). **Richiede privilegi Admin**.
- `DELETE /api/products/:id`: Elimina un prodotto e le sue immagini associate. **Richiede privilegi Admin**.

## Funzionalità Frontend
- **Catalogo Dinamico**: Visualizzazione a griglia con filtri e badge (Nuovo/Usato).
- **Dettaglio Prodotto**: Pagina dedicata con galleria immagini interattiva e pulsanti di contatto rapido (Telefono/Email).
- **Area Admin**: Accesso protetto tramite password per inserimento e rimozione prodotti.
- **Upload Immagini**: Sistema di caricamento multiplo (fino a 10 foto per prodotto).

## Gestione File
Le immagini caricate vengono salvate nella cartella `/uploads` nel root del progetto. Il server Express serve questi file staticamente tramite l'endpoint `/uploads`.

## Note di Sicurezza
- La password amministratore è attualmente configurata via codice in `server.ts` per semplicità di sviluppo.
- In produzione, è fondamentale che la variabile `NODE_ENV` sia impostata su `production` per abilitare i cookie sicuri.
- L'header `trust proxy` è abilitato per permettere il funzionamento delle sessioni dietro proxy Apache/Nginx.
