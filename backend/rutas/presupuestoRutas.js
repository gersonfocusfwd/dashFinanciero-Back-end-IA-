const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH  = path.join(__dirname, '..', 'db.json');
const leerDB   = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const guardarDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// GET /api/presupuesto — listar ítems con ejecución real
router.get('/', (req, res) => {
  const db = leerDB();
  const presupuesto = db.presupuesto || [];

  // Calcular ejecución real por categoría
  const ejecucion = presupuesto.map(item => {
    const gastado = db.transacciones
      .filter(t => t.categoria === item.categoria && t.monto < 0 && !t.esInversion)
      .reduce((sum, t) => sum + Math.abs(t.monto), 0);

    const porcentaje = item.limite > 0 ? parseFloat(((gastado / item.limite) * 100).toFixed(1)) : 0;
    const estado = porcentaje >= 100 ? 'excedido' : porcentaje >= 80 ? 'alerta' : 'ok';

    return { ...item, gastado, porcentaje, estado };
  });

  res.json({ ok: true, data: ejecucion });
});

// POST /api/presupuesto — crear ítem
router.post('/', (req, res) => {
  const { categoria, limite, descripcion } = req.body;
  if (!categoria || !limite) {
    return res.status(400).json({ ok: false, mensaje: 'categoria y limite son obligatorios' });
  }
  const db  = leerDB();
  const nuevo = { id: uuidv4(), categoria: categoria.trim(), limite: Number(limite), descripcion: descripcion || '' };
  db.presupuesto = db.presupuesto || [];
  db.presupuesto.push(nuevo);
  guardarDB(db);
  res.status(201).json({ ok: true, mensaje: 'Presupuesto creado', data: nuevo });
});

// PUT /api/presupuesto/:id
router.put('/:id', (req, res) => {
  const db  = leerDB();
  db.presupuesto = db.presupuesto || [];
  const idx = db.presupuesto.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, mensaje: 'Ítem no encontrado' });

  ['categoria', 'limite', 'descripcion'].forEach(campo => {
    if (req.body[campo] !== undefined) {
      db.presupuesto[idx][campo] = campo === 'limite' ? Number(req.body[campo]) : req.body[campo];
    }
  });
  guardarDB(db);
  res.json({ ok: true, mensaje: 'Presupuesto actualizado', data: db.presupuesto[idx] });
});

// DELETE /api/presupuesto/:id
router.delete('/:id', (req, res) => {
  const db = leerDB();
  db.presupuesto = (db.presupuesto || []).filter(p => p.id !== req.params.id);
  guardarDB(db);
  res.json({ ok: true, mensaje: 'Presupuesto eliminado' });
});

module.exports = router;
