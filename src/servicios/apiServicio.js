/**
 * Capa de comunicación con el backend REST
 * Todas las funciones retornan Promises y manejan errores de forma consistente
 */

const BASE_URL = 'http://localhost:3001/api';

const manejarRespuesta = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || `Error ${res.status}`);
  return data;
};

// ─── KPIs ────────────────────────────────────────────────────────────────────

export const obtenerKPIs = () =>
  fetch(`${BASE_URL}/kpis`).then(manejarRespuesta);

export const obtenerHistoricoKPIs = () =>
  fetch(`${BASE_URL}/kpis/historico`).then(manejarRespuesta);

// ─── Transacciones ───────────────────────────────────────────────────────────

export const obtenerTransacciones = (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  return fetch(`${BASE_URL}/transacciones${params ? `?${params}` : ''}`).then(manejarRespuesta);
};

export const crearTransaccion = (datos) =>
  fetch(`${BASE_URL}/transacciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(manejarRespuesta);

export const actualizarTransaccion = (id, datos) =>
  fetch(`${BASE_URL}/transacciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(manejarRespuesta);

export const eliminarTransaccion = (id) =>
  fetch(`${BASE_URL}/transacciones/${id}`, { method: 'DELETE' }).then(manejarRespuesta);

// ─── Presupuesto ─────────────────────────────────────────────────────────────

export const obtenerPresupuesto = () =>
  fetch(`${BASE_URL}/presupuesto`).then(manejarRespuesta);

export const crearPresupuesto = (datos) =>
  fetch(`${BASE_URL}/presupuesto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(manejarRespuesta);

export const actualizarPresupuesto = (id, datos) =>
  fetch(`${BASE_URL}/presupuesto/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(manejarRespuesta);

export const eliminarPresupuesto = (id) =>
  fetch(`${BASE_URL}/presupuesto/${id}`, { method: 'DELETE' }).then(manejarRespuesta);

// ─── Configuración ───────────────────────────────────────────────────────────

export const obtenerConfiguracion = () =>
  fetch(`${BASE_URL}/configuracion`).then(manejarRespuesta);

export const actualizarConfiguracion = (datos) =>
  fetch(`${BASE_URL}/configuracion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  }).then(manejarRespuesta);

// ─── Reporte ─────────────────────────────────────────────────────────────────

export const obtenerReporte = () =>
  fetch(`${BASE_URL}/reporte`).then(manejarRespuesta);

// ─── Health ──────────────────────────────────────────────────────────────────

export const verificarConexion = () =>
  fetch(`${BASE_URL}/health`).then(manejarRespuesta);
