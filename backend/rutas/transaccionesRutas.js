import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const dbPath = path.join(__dirname, '../db.json');

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.transacciones);
});

router.post('/', (req, res) => {
  const db = readDB();
  const nuevaTransaccion = { ...req.body, id: uuidv4() };
  db.transacciones.push(nuevaTransaccion);
  writeDB(db);
  res.status(201).json(nuevaTransaccion);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const index = db.transacciones.findIndex(t => t.id === id);
  if (index !== -1) {
    db.transacciones[index] = { ...db.transacciones[index], ...req.body };
    writeDB(db);
    res.json(db.transacciones[index]);
  } else {
    res.status(404).json({ mensaje: 'Transacción no encontrada' });
  }
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.transacciones = db.transacciones.filter(t => t.id !== id);
  writeDB(db);
  res.status(204).send();
});

export default router;
