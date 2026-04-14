const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { calcularMargenBruto, calcularROI, calcularPuntoEquilibrio } = require('../logica/calculos');
const { procesarDatosFinancieros } = require('../logica/procesador');

const DB_PATH = path.join(__dirname, '..', 'db.json');
const leerDB  = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// GET /api/kpis — devuelve KPIs calculados en el servidor
router.get('/', (req, res) => {
  const db = leerDB();
  const datos = procesarDatosFinancieros(db.transacciones);
  const cfg   = db.configuracion;

  const margenBruto      = calcularMargenBruto(datos.ingresos, datos.costos);
  const roi               = calcularROI(datos.utilidadNeta, datos.inversiones);
  const puntoEquilibrio   = calcularPuntoEquilibrio(datos.gastosFijos, cfg.precioPromedioVenta, cfg.costoVariableUnitario);

  // Indicadores extra
  const liquidez          = datos.ingresos > 0 ? datos.utilidadNeta / datos.ingresos : 0;
  const eficienciaOperativa = datos.ingresos > 0
    ? ((datos.ingresos - datos.costos - datos.gastosFijos) / datos.ingresos)
    : 0;
  const ratioEndeudamiento = datos.inversiones > 0 ? datos.costos / datos.inversiones : 0;

  res.json({
    ok: true,
    data: {
      margenBruto:          parseFloat((margenBruto * 100).toFixed(2)),
      roi:                  parseFloat(roi.toFixed(2)),
      puntoEquilibrio:      parseFloat(puntoEquilibrio.toFixed(0)),
      utilidadNeta:         datos.utilidadNeta,
      ingresos:             datos.ingresos,
      costosTotales:        datos.costos + datos.gastosFijos + datos.gastosVariables,
      inversiones:          datos.inversiones,
      liquidez:             parseFloat((liquidez * 100).toFixed(2)),
      eficienciaOperativa:  parseFloat((eficienciaOperativa * 100).toFixed(2)),
      ratioEndeudamiento:   parseFloat(ratioEndeudamiento.toFixed(3)),
      empresa:              db.empresa,
      periodo:              db.periodo,
    },
  });
});

// GET /api/kpis/historico — distribución mensual simulada
router.get('/historico', (req, res) => {
  const db    = leerDB();
  const datos = procesarDatosFinancieros(db.transacciones);
  const base  = datos.ingresos / 6;

  const historico = [
    { mes: 'Ene', ingresos: +(base * 0.72).toFixed(0), gastos: +(base * 0.60).toFixed(0), utilidad: +(base * 0.12).toFixed(0) },
    { mes: 'Feb', ingresos: +(base * 0.85).toFixed(0), gastos: +(base * 0.68).toFixed(0), utilidad: +(base * 0.17).toFixed(0) },
    { mes: 'Mar', ingresos: +(base * 0.90).toFixed(0), gastos: +(base * 0.71).toFixed(0), utilidad: +(base * 0.19).toFixed(0) },
    { mes: 'Abr', ingresos: +(base * 1.05).toFixed(0), gastos: +(base * 0.78).toFixed(0), utilidad: +(base * 0.27).toFixed(0) },
    { mes: 'May', ingresos: +(base * 1.12).toFixed(0), gastos: +(base * 0.82).toFixed(0), utilidad: +(base * 0.30).toFixed(0) },
    { mes: 'Jun', ingresos: +(base * 1.20).toFixed(0), gastos: +(base * 0.85).toFixed(0), utilidad: datos.utilidadNeta },
  ];

  res.json({ ok: true, data: historico });
});

module.exports = router;
