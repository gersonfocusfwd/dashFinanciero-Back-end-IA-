import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, FileText, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { obtenerReporte } from '../servicios/apiServicio';
import '../estilos/Tabla.css';

const PanelReporte = () => {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    setCargando(true); setError('');
    try {
      const resp = await obtenerReporte();
      setReporte(resp.data);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const exportarCSV = () => {
    if (!reporte?.csv) return;
    const blob = new Blob([reporte.csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${reporte.periodo?.replace(/\s/g, '_') || 'financiero'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (cargando) return <div className="tabla-loading">Generando reporte desde el servidor…</div>;
  if (error)    return <div className="tabla-error" style={{ display:'flex', flexDirection:'column', gap:'1rem', alignItems:'center' }}>
    <p>⚠️ {error}</p>
    <button className="btn-primary" onClick={cargar}><RefreshCw size={14} /><span>Reintentar</span></button>
  </div>;
  if (!reporte) return null;

  const { resumen, porCategoria } = reporte;

  const metricasResumen = [
    { label: 'Ingresos Totales',  valor: resumen.ingresos,      color: 'var(--green)', icono: <TrendingUp size={15} />, prefijo: '$' },
    { label: 'Costos Totales',    valor: resumen.costosTotales,  color: 'var(--pink)',  icono: <TrendingDown size={15} />, prefijo: '$' },
    { label: 'Utilidad Neta',     valor: resumen.utilidadNeta,   color: 'var(--cyan)',  icono: <TrendingUp size={15} />, prefijo: '$' },
    { label: 'Inversiones',       valor: resumen.inversiones,    color: '#a78bfa',      icono: <Layers size={15} />, prefijo: '$' },
    { label: 'Margen Bruto',      valor: resumen.margenBruto,    color: 'var(--cyan)',  icono: null, sufijo: '%' },
    { label: 'ROI',               valor: resumen.roi,            color: 'var(--green)', icono: null, sufijo: '%' },
    { label: 'Punto Equilibrio',  valor: resumen.puntoEquilibrio,color: 'var(--amber)', icono: null, sufijo: ' u' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header reporte */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Reporte Ejecutivo
          </p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{reporte.empresa}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Período: <strong style={{ color: 'var(--cyan)' }}>{reporte.periodo}</strong>
            &nbsp;·&nbsp; Generado: {new Date(reporte.generadoEn).toLocaleString('es-MX')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={exportarCSV} id="btn-exportar-csv">
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
          <button className="btn-cancel" onClick={cargar} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <RefreshCw size={13} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Métricas en grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.9rem' }}>
        {metricasResumen.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              borderTop: `2px solid ${m.color}`,
            }}
          >
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              {m.label}
            </p>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: m.color, fontFamily: 'var(--font-main)', lineHeight: 1 }}>
              {m.prefijo || ''}{typeof m.valor === 'number' ? m.valor.toLocaleString() : m.valor}{m.sufijo || ''}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tabla por categoría */}
      <div>
        <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          <FileText size={12} style={{ display:'inline', marginRight:'0.4rem' }} />
          Detalle por Categoría
        </p>
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr><th>Categoría</th><th>Tipo</th><th>Total ($)</th></tr>
            </thead>
            <tbody>
              {porCategoria.sort((a, b) => b.total - a.total).map((row, i) => (
                <motion.tr key={row.categoria} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td className="cat-cell">{row.categoria}</td>
                  <td>
                    <span className={`tipo-badge tipo-${row.tipo === 'Ingreso' ? 'ingreso' : row.tipo === 'Inversión' ? 'inversion' : 'gasto'}`}>
                      {row.tipo}
                    </span>
                  </td>
                  <td>
                    <span className={row.total > 0 ? 'monto-positivo' : 'monto-negativo'}>
                      {row.total > 0 ? '+' : ''}{row.total.toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PanelReporte;
