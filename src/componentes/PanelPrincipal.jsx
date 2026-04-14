import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KpiCard from './KpiCard';
import GraficoComparativo from './GraficoComparativo';
import AnalisisIA from './AnalisisIA';
import TablaTransacciones from './TablaTransacciones';
import { getKpis, getConfiguracion } from '../servicios/apiServicio';
import '../estilos/Global.css';
import '../estilos/Dashboard.css';

const PanelPrincipal = () => {
  const [activa, setActiva] = useState('Dashboard');
  const [data, setData] = useState({ kpis: null, datosProcesados: null });
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const conf = await getConfiguracion();
      const res = await getKpis();
      setConfig(conf);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo recargar KPIs y Config cuando volvamos a la pestaña Dashboard
    if (activa === 'Dashboard') {
      cargarDashboard();
    }
  }, [activa]);

  const ahora = new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  if (loading && !data.kpis) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ai-pulse" />
      </div>
    );
  }

  const { kpis, datosProcesados } = data;

  const kpiCards = [
    {
      titulo: 'Margen Bruto',
      valor: (kpis.margenBruto * 100).toFixed(1),
      simbolo: '%',
      descripcion: 'Eficiencia de producción',
      color: '#00d4ff',
      colorDim: 'rgba(0,212,255,0.12)',
    },
    {
      titulo: 'ROI',
      valor: kpis.roi.toFixed(1),
      simbolo: '%',
      descripcion: 'Retorno de inversión',
      color: '#7c3aed',
      colorDim: 'rgba(124,58,237,0.12)',
    },
    {
      titulo: 'Punto de Equilibrio',
      valor: kpis.puntoEquilibrio.toFixed(0),
      simbolo: 'u',
      descripcion: 'Meta mínima de ventas',
      color: '#f43f8e',
      colorDim: 'rgba(244,63,142,0.12)',
    },
    {
      titulo: 'Utilidad Neta',
      valor: kpis.utilidadNeta.toLocaleString(),
      simbolo: '$',
      descripcion: 'Beneficio final del periodo',
      color: '#00ffa3',
      colorDim: 'rgba(0,255,163,0.12)',
    },
  ];

  return (
    <div className="dashboard-wrapper">

      {/* ── Top Navigation Bar ── */}
      <motion.nav
        className="dash-navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="nav-brand">
          <div className="nav-logo-icon">💹</div>
          <span className="nav-brand-name">
            Financiero <span>Pro</span>
          </span>
        </div>

        <div className="nav-center">
          {['Dashboard', 'Transacciones'].map((item) => (
            <motion.button
              key={item}
              className={`nav-pill ${activa === item ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiva(item)}
            >
              {item}
            </motion.button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-badge-live">
            <div className="live-dot" />
            BACKEND CONNECTED
          </div>
          <span className="nav-date">{ahora}</span>
        </div>
      </motion.nav>

      {/* ── Main Dashboard Content ── */}
      <main className="dashboard-container">

        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="section-eyebrow">// {activa.toUpperCase()}</p>
          <h1 className="section-title">
            {activa === 'Dashboard' ? 'Panel de Control' : 'Historial Operativo'}
          </h1>
          <p className="section-subtitle">
            {config?.empresa} &nbsp;·&nbsp; {config?.periodo}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activa === 'Dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* KPI Cards */}
              <div className="metrics-grid">
                {kpiCards.map((kpi, i) => (
                  <KpiCard key={kpi.titulo} {...kpi} index={i} />
                ))}
              </div>

              {/* Chart + AI side by side */}
              <div className="main-content-layout">
                <GraficoComparativo datos={datosProcesados} />
                <AnalisisIA kpisCalculados={kpis} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="transacciones"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TablaTransacciones />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default PanelPrincipal;
