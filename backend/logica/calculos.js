/**
 * Lógica pura de cálculos financieros (backend ESM)
 */

export const calcularMargenBruto = (ingresos, costos) => {
  if (ingresos === 0) return 0;
  return (ingresos - costos) / ingresos;
};

export const calcularROI = (utilidadNeta, inversionTotal) => {
  if (inversionTotal === 0) return 0;
  return (utilidadNeta / inversionTotal) * 100;
};

export const calcularPuntoEquilibrio = (gastosFijos, precioPromedio, costoVariable) => {
  const margenUnitario = precioPromedio - costoVariable;
  if (margenUnitario === 0) return 0;
  return gastosFijos / margenUnitario;
};
