const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'db.json');

const leerDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const guardarDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET /api/transacciones  — listar todas (con filtros opcionales)
router.get('/', (req, res) => {
  const db = leerDB();
  let { tipo, fecha_inicio, fecha_fin, q } = req.query;
  let lista = db.transacciones;

  // Filtro por tipo
  if (tipo === 'ingreso')   lista = lista.filter(t => t.monto > 0);
  if (tipo === 'gasto')     lista = lista.filter(t => t.monto < 0 && !t.esInversion);
  if (tipo === 'inversion') lista = lista.filter(t => t.esInversion);

  // Filtro por rango de fechas
  if (fecha_inicio) lista = lista.filter(t => t.fecha >= fecha_inicio);
  if (fecha_fin)    lista = lista.filter(t => t.fecha <= fecha_fin);

  // Búsqueda por texto
  if (q) {
    const term = q.toLowerCase();
    lista = lista.filter(t =>
      t.categoria.toLowerCase().includes(term) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(term))
    );
  }

  // Ordenar por fecha desc
  lista.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  res.json({ ok: true, total: lista.length, data: lista });
});

// GET /api/transacciones/:id
router.get('/:id', (req, res) => {
  const db = leerDB();
  const tx = db.transacciones.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).json({ ok: false, mensaje: 'Transacción no encontrada' });
  res.json({ ok: true, data: tx });
});

// POST /api/transacciones — crear
router.post('/', (req, res) => {
  const { categoria, monto, descripcion, fecha, esInversion, esCostoDirecto, esFijo } = req.body;

  if (!categoria || monto === undefined) {
    return res.status(400).json({ ok: false, mensaje: 'categoria y monto son obligatorios' });
  }

  const nueva = {
    id: uuidv4(),
    categoria: categoria.trim(),
    monto: Number(monto),
    descripcion: descripcion || '',
    fecha: fecha || new Date().toISOString().split('T')[0],
    esInversion: !!esInversion,
    esCostoDirecto: !!esCostoDirecto,
    esFijo: !!esFijo,
  };

  const db = leerDB();
  db.transacciones.push(nueva);
  guardarDB(db);

  res.status(201).json({ ok: true, mensaje: 'Transacción creada', data: nueva });
});

// PUT /api/transacciones/:id — editar
router.put('/:id', (req, res) => {
  const db = leerDB();
  const idx = db.transacciones.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: 'Transacción no encontrada' });

  const campos = ['categoria', 'monto', 'descripcion', 'fecha', 'esInversion', 'esCostoDirecto', 'esFijo'];
  campos.forEach(campo => {
    if (req.body[campo] !== undefined) {
      db.transacciones[idx][campo] = campo === 'monto' ? Number(req.body[campo]) : req.body[campo];
    }
  });

  guardarDB(db);
  res.json({ ok: true, mensaje: 'Transacción actualizada', data: db.transacciones[idx] });
});

// DELETE /api/transacciones/:id
router.delete('/:id', (req, res) => {
  const db = leerDB();
  const antes = db.transacciones.length;
  db.transacciones = db.transacciones.filter(t => t.id !== req.params.id);
  if (db.transacciones.length === antes) {
    return res.status(404).json({ ok: false, mensaje: 'Transacción no encontrada' });
  }
  guardarDB(db);
  res.json({ ok: true, mensaje: 'Transacción eliminada' });
});

module.exports = router;
