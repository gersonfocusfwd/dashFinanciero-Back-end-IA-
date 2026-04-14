import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import transaccionesRutas from './rutas/transaccionesRutas.js';
import kpisRutas from './rutas/kpisRutas.js';
import presupuestoRutas from './rutas/presupuestoRutas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servidor = express();
const PORT = 3001;

// Middlewares
servidor.use(cors());
servidor.use(express.json());

// Rutas
servidor.use('/api/transacciones', transaccionesRutas);
servidor.use('/api/kpis', kpisRutas);
servidor.use('/api/presupuesto', presupuestoRutas);

const dbPath = path.join(__dirname, 'db.json');
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

servidor.get('/api/configuracion', (req, res) => {
  const db = readDB();
  res.json({ empresa: db.empresa, periodo: db.periodo, ...db.configuracion });
});

servidor.listen(PORT, () => {
  console.log(`Backend financiero corriendo en http://localhost:${PORT}`);
});
