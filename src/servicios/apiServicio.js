const API_URL = 'http://localhost:3001/api';

export const getKpis = async () => {
  const res = await fetch(`${API_URL}/kpis`);
  if (!res.ok) throw new Error('Error al obtener KPIs');
  return res.json();
};

export const getTransacciones = async () => {
  const res = await fetch(`${API_URL}/transacciones`);
  if (!res.ok) throw new Error('Error al obtener transacciones');
  return res.json();
};

export const crearTransaccion = async (transaccion) => {
  const res = await fetch(`${API_URL}/transacciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaccion)
  });
  if (!res.ok) throw new Error('Error al crear transacción');
  return res.json();
};

export const eliminarTransaccion = async (id) => {
  const res = await fetch(`${API_URL}/transacciones/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar transacción');
};

export const getPresupuesto = async () => {
  const res = await fetch(`${API_URL}/presupuesto`);
  if (!res.ok) throw new Error('Error al obtener presupuesto');
  return res.json();
};

export const getConfiguracion = async () => {
  const res = await fetch(`${API_URL}/configuracion`);
  if (!res.ok) throw new Error('Error al obtener configuración');
  return res.json();
};
