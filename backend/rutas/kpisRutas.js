import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { procesarDatosFinancieros } from '../logica/procesador.js';
import { calcularMargenBruto, calcularROI, calcularPuntoEquilibrio } from '../logica/calculos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const dbPath = path.join(__dirname, '../db.json');
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

router.get('/', (req, res) => {
  const db = readDB();
  const datosProcesados = procesarDatosFinancieros(db.transacciones);
  const { precioPromedioVenta, costoVariableUnitario } = db.configuracion;

  const kpis = {
    margenBruto: calcularMargenBruto(datosProcesados.ingresos, datosProcesados.costos),
    roi: calcularROI(datosProcesados.utilidadNeta, datosProcesados.inversiones),
    puntoEquilibrio: calcularPuntoEquilibrio(datosProcesados.gastosFijos, precioPromedioVenta, costoVariableUnitario),
    utilidadNeta: datosProcesados.utilidadNeta,
    ingresos: datosProcesados.ingresos,
    costos: datosProcesados.costos,
    gastosFijos: datosProcesados.gastosFijos,
    gastosVariables: datosProcesados.gastosVariables,
    inversiones: datosProcesados.inversiones,
  };

  res.json({ kpis, datosProcesados });
});

export default router;
