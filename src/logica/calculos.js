/**
 * Lógica pura de cálculos financieros
 */

/**
 * Calcula el Margen Bruto.
 * Fórmula: (Ingresos - Costos) / Ingresos
 */
export const calcularMargenBruto = (ingresos, costos) => {
  if (ingresos === 0) return 0;
  return (ingresos - costos) / ingresos;
};

/**
 * Calcula el ROI (Retorno de Inversión).
 * Fórmula: (Utilidad Neta / Inversión Total) * 100
 */
export const calcularROI = (utilidadNeta, inversionTotal) => {
  if (inversionTotal === 0) return 0;
  return (utilidadNeta / inversionTotal) * 100;
};

/**
 * Calcula el Punto de Equilibrio.
 * Fórmula: Gastos Fijos / (Precio Promedio - Costo Variable)
 */
export const calcularPuntoEquilibrio = (gastosFijos, precioPromedio, costoVariable) => {
  const margenUnitario = precioPromedio - costoVariable;
  if (margenUnitario === 0) return 0;
  return gastosFijos / margenUnitario;
};
