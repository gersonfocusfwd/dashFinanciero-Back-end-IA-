const express = require('express');
const cors    = require('cors');
const path    = require('path');

const transaccionesRutas  = require('./rutas/transaccionesRutas');
const kpisRutas           = require('./rutas/kpisRutas');
const presupuestoRutas    = require('./rutas/presupuestoRutas');
const configuracionRutas  = require('./rutas/configuracionRutas');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ── Rutas API ──
app.use('/api/transacciones', transaccionesRutas);
app.use('/api/kpis',          kpisRutas);
app.use('/api/presupuesto',   presupuestoRutas);
app.use('/api',               configuracionRutas);   // /api/configuracion y /api/reporte

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Financiero Pro API corriendo 🚀', timestamp: new Date().toISOString() });
});

// ── 404 catch-all ──
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.method} ${req.url} no encontrada` });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Error interno:', err.message);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor', detalle: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🟢 Financiero Pro API corriendo en http://localhost:${PORT}`);
  console.log(`   → GET  /api/health`);
  console.log(`   → GET  /api/kpis`);
  console.log(`   → CRUD /api/transacciones`);
  console.log(`   → CRUD /api/presupuesto`);
  console.log(`   → GET  /api/reporte\n`);
});

module.exports = app;
