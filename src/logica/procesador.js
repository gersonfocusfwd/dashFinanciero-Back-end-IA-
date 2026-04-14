/**
 * Especialista en Ingeniería de Datos: Procesamiento de transacciones financieras
 */

/**
 * Procesa y estructura datos financieros desde una lista de movimientos.
 * Clasifica cada movimiento en 'Ingreso', 'Gasto' o 'Inversión'.
 * @param {Array} transacciones 
 * @returns {Object} Datos estructurados para el dashboard
 */
export const procesarDatosFinancieros = (transacciones) => {
  const inicial = {
    ingresos: 0,
    costos: 0,
    gastosFijos: 0,
    gastosVariables: 0,
    inversiones: 0,
    utilidadNeta: 0,
    historico: [] // Para gráficos comparativos
  };

  const procesados = transacciones.reduce((acc, current) => {
    const { monto, categoria, esInversion, esCostoDirecto, esFijo } = current;

    // Clasificación y Acumulación
    if (monto > 0) {
      acc.ingresos += monto;
      acc.historico.push({ nombre: categoria, tipo: "Ingreso", valor: monto });
    } else {
      const valorAbsoluto = Math.abs(monto);
      if (esInversion) {
        acc.inversiones += valorAbsoluto;
        acc.historico.push({ nombre: categoria, tipo: "Inversión", valor: valorAbsoluto });
      } else if (esCostoDirecto) {
        acc.costos += valorAbsoluto;
        acc.historico.push({ nombre: categoria, tipo: "Gasto (Costo)", valor: valorAbsoluto });
      } else {
        if (esFijo) acc.gastosFijos += valorAbsoluto;
        else acc.gastosVariables += valorAbsoluto;
        acc.historico.push({ nombre: categoria, tipo: "Gasto", valor: valorAbsoluto });
      }
    }

    return acc;
  }, inicial);

  procesados.utilidadNeta = procesados.ingresos - (procesados.costos + procesados.gastosFijos + procesados.gastosVariables);
  
  return procesados;
};
