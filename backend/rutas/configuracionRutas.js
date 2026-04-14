const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { procesarDatosFinancieros } = require('../logica/procesador');
const { calcularMargenBruto, calcularROI, calcularPuntoEquilibrio } = require('../logica/calculos');

const DB_PATH = path.join(__dirname, '..', 'db.json');
const leerDB  = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// GET /api/configuracion
router.get('/', (req, res) => {
  const db = leerDB();
  res.json({ ok: true, data: { ...db.configuracion, empresa: db.empresa, periodo: db.periodo } });
});

// PUT /api/configuracion
router.put('/', (req, res) => {
  const db = leerDB();
  const { precioPromedioVenta, costoVariableUnitario, empresa, periodo } = req.body;
  if (precioPromedioVenta !== undefined) db.configuracion.precioPromedioVenta = Number(precioPromedioVenta);
  if (costoVariableUnitario !== undefined) db.configuracion.costoVariableUnitario = Number(costoVariableUnitario);
  if (empresa)  db.empresa  = empresa;
  if (periodo)  db.periodo  = periodo;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  res.json({ ok: true, mensaje: 'Configuración actualizada', data: db.configuracion });
});

// GET /api/reporte — resumen ejecutivo del período
router.get('/reporte', (req, res) => {
  const db    = leerDB();
  const datos = procesarDatosFinancieros(db.transacciones);
  const cfg   = db.configuracion;

  const mb  = calcularMargenBruto(datos.ingresos, datos.costos);
  const roi = calcularROI(datos.utilidadNeta, datos.inversiones);
  const pe  = calcularPuntoEquilibrio(datos.gastosFijos, cfg.precioPromedioVenta, cfg.costoVariableUnitario);

  // Resumen por categoría
  const porCategoria = db.transacciones.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = { categoria: t.categoria, total: 0, tipo: t.monto > 0 ? 'Ingreso' : (t.esInversion ? 'Inversión' : 'Gasto') };
    acc[t.categoria].total += t.monto;
    return acc;
  }, {});

  // CSV
  const csvLineas = ['Categoría,Tipo,Total ($)'];
  Object.values(porCategoria).forEach(r => {
    csvLineas.push(`"${r.categoria}","${r.tipo}",${r.total}`);
  });
  const csv = csvLineas.join('\n');

  res.json({
    ok: true,
    data: {
      empresa:    db.empresa,
      periodo:    db.periodo,
      generadoEn: new Date().toISOString(),
      resumen: {
        ingresos:      datos.ingresos,
        costosTotales: datos.costos + datos.gastosFijos + datos.gastosVariables,
        utilidadNeta:  datos.utilidadNeta,
        inversiones:   datos.inversiones,
        margenBruto:   parseFloat((mb * 100).toFixed(2)),
        roi:           parseFloat(roi.toFixed(2)),
        puntoEquilibrio: parseFloat(pe.toFixed(0)),
      },
      porCategoria: Object.values(porCategoria),
      csv,
    },
  });
});

module.exports = router;
