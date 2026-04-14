/**
 * Calcula el Margen Bruto.
 * Fórmula: (Ventas - Costos de Ventas) / Ventas
 * @param {number} ventas 
 * @param {number} costos 
 * @returns {number}
 */
export const calcularMargenBruto = (ventas, costos) => {
  if (ventas === 0) return 0;
  return (ventas - costos) / ventas;
};

/**
 * Calcula el ROI (Retorno de Inversión).
 * Fórmula: (Beneficio Neto / Inversión) * 100
 * @param {number} beneficioNeto 
 * @param {number} inversion 
 * @returns {number}
 */
export const calcularROI = (beneficioNeto, inversion) => {
  if (inversion === 0) return 0;
  return (beneficioNeto / inversion) * 100;
};

/**
 * Calcula el Punto de Equilibrio.
 * Fórmula: Costos Fijos / (Precio de Venta - Costo Variable)
 * @param {number} costosFijos 
 * @param {number} precioVenta 
 * @param {number} costoVariable 
 * @returns {number}
 */
export const calcularPuntoEquilibrio = (costosFijos, precioVenta, costoVariable) => {
  const margenUnitario = precioVenta - costoVariable;
  if (margenUnitario === 0) return 0;
  return costosFijos / margenUnitario;
};
