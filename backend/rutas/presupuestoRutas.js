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
  res.json(db.presupuesto || []);
});

router.post('/', (req, res) => {
  const db = readDB();
  if (!db.presupuesto) db.presupuesto = [];
  const nuevoPresupuesto = { ...req.body, id: uuidv4() };
  db.presupuesto.push(nuevoPresupuesto);
  writeDB(db);
  res.status(201).json(nuevoPresupuesto);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  if (!db.presupuesto) return res.status(204).send();
  db.presupuesto = db.presupuesto.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.status(204).send();
});

export default router;
