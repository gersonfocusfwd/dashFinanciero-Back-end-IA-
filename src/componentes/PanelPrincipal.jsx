import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Receipt, PiggyBank, FileBarChart2,
  Wifi, WifiOff,
} from 'lucide-react';

import KpiCard              from './KpiCard';
import GraficoComparativo   from './GraficoComparativo';
import AnalisisIA           from './AnalisisIA';
import TablaTransacciones   from './TablaTransacciones';
import PanelPresupuesto     from './PanelPresupuesto';
import PanelReporte         from './PanelReporte';

import { obtenerKPIs, obtenerHistoricoKPIs, verificarConexion } from '../servicios/apiServicio';

import '../estilos/Global.css';
import '../estilos/Dashboard.css';

/* ── Pestañas ── */
const TABS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'transacciones', label: 'Transacciones', icon: Receipt },
  { id: 'presupuesto',   label: 'Presupuesto',   icon: PiggyBank },
  { id: 'reporte',       label: 'Reporte',        icon: FileBarChart2 },
];

const PanelPrincipal = () => {
  const [tabActiva, setTabActiva]         = useState('dashboard');
  const [kpis, setKpis]                   = useState(null);
  const [historico, setHistorico]         = useState([]);
  const [cargandoKpis, setCargandoKpis]   = useState(true);
  const [errorAPI, setErrorAPI]           = useState('');
  const [backendOk, setBackendOk]         = useState(null); // null=checking, true/false

  /* ── Verificar conexión ── */
  useEffect(() => {
    verificarConexion()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  /* ── Cargar KPIs del backend ── */
  useEffect(() => {
    if (backendOk === false) { setCargandoKpis(false); setErrorAPI('Backend desconectado'); return; }
    if (backendOk !== true) return;

    Promise.all([obtenerKPIs(), obtenerHistoricoKPIs()])
      .then(([kpisResp, histResp]) => {
        setKpis(kpisResp.data);
        setHistorico(histResp.data);
      })
      .catch(e => setErrorAPI(e.message))
      .finally(() => setCargandoKpis(false));
  }, [backendOk]);

  /* ── KPI cards config ── */
  const kpiCards = useMemo(() => {
    if (!kpis) return [];
    return [
      { titulo: 'Margen Bruto',       valor: kpis.margenBruto,        simbolo: '%', descripcion: 'Eficiencia de producción',    color: '#00d4ff', colorDim: 'rgba(0,212,255,0.12)' },
      { titulo: 'ROI',                valor: kpis.roi,                 simbolo: '%', descripcion: 'Retorno de inversión',         color: '#7c3aed', colorDim: 'rgba(124,58,237,0.12)' },
      { titulo: 'Punto de Equilibrio',valor: kpis.puntoEquilibrio,     simbolo: 'u', descripcion: 'Meta mínima de ventas',        color: '#f43f8e', colorDim: 'rgba(244,63,142,0.12)' },
      { titulo: 'Utilidad Neta',      valor: kpis.utilidadNeta?.toLocaleString(), simbolo: '$', descripcion: 'Beneficio final del periodo', color: '#00ffa3', colorDim: 'rgba(0,255,163,0.12)' },
    ];
  }, [kpis]);

  const ahora = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  /* ── Fallback datos para gráfico cuando kpis cargados ── */
  const datosGrafico = useMemo(() => ({
    ingresos:      kpis?.ingresos      || 500000,
    utilidadNeta:  kpis?.utilidadNeta  || 75000,
    costos:        kpis?.costosTotales || 145000,
    gastosFijos: 0, gastosVariables: 0,
    historicoMensual: historico,
  }), [kpis, historico]);

  /* ── KPIs para el componente IA ── */
  const kpisIA = useMemo(() => ({
    margenBruto:    (kpis?.margenBruto  || 0) / 100,
    roi:             kpis?.roi           || 0,
    puntoEquilibrio: kpis?.puntoEquilibrio || 0,
  }), [kpis]);

  return (
    <div className="dashboard-wrapper">

      {/* ── Navbar ── */}
      <motion.nav
        className="dash-navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="nav-brand">
          <div className="nav-logo-icon">💹</div>
          <span className="nav-brand-name">Financiero <span>Pro</span></span>
        </div>

        <div className="nav-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                className={`nav-pill ${tabActiva === tab.id ? 'active' : ''}`}
                onClick={() => setTabActiva(tab.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Icon size={13} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <div className="nav-right">
          {/* Badge conexión backend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.72rem', fontWeight: 700,
            padding: '0.3rem 0.75rem', borderRadius: '99px',
            background: backendOk === true ? 'rgba(0,255,163,0.08)' : backendOk === false ? 'rgba(244,63,142,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${backendOk === true ? 'rgba(0,255,163,0.25)' : backendOk === false ? 'rgba(244,63,142,0.3)' : 'var(--glass-border)'}`,
            color: backendOk === true ? 'var(--green)' : backendOk === false ? 'var(--pink)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            {backendOk === true  && <><div className="live-dot" />API OK</>}
            {backendOk === false && <><WifiOff size={11} /> OFFLINE</>}
            {backendOk === null  && <><Wifi size={11} /> …</>}
          </div>
          <div className="nav-badge-live"><div className="live-dot" />LIVE</div>
          <span className="nav-date">{ahora}</span>
        </div>
      </motion.nav>

      {/* ── Contenido principal ── */}
      <main className="dashboard-container">

        <AnimatePresence mode="wait">

          {/* ═══ TAB: DASHBOARD ═══ */}
          {tabActiva === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                className="section-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p className="section-eyebrow">// Panel de Control</p>
                <h1 className="section-title">Dashboard Financiero</h1>
                <p className="section-subtitle">
                  {kpis ? `${kpis.empresa} · ${kpis.periodo}` : 'Cargando datos...'}
                </p>
              </motion.div>

              {/* KPI Cards */}
              {cargandoKpis ? (
                <div className="metrics-grid">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="kpi-card glass" style={{ height: '140px', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : errorAPI ? (
                <div className="tabla-error" style={{ marginBottom: '1.5rem' }}>
                  ⚠️ Backend desconectado: {errorAPI}. Asegúrate de correr <code>node backend/servidor.js</code>
                </div>
              ) : (
                <div className="metrics-grid">
                  {kpiCards.map((kpi, i) => (
                    <KpiCard key={kpi.titulo} {...kpi} index={i} />
                  ))}
                </div>
              )}

              {/* Chart + IA */}
              <div className="main-content-layout">
                <GraficoComparativo datos={datosGrafico} historicoExterno={historico} />
                <AnalisisIA kpisCalculados={kpisIA} />
              </div>
            </motion.div>
          )}

          {/* ═══ TAB: TRANSACCIONES ═══ */}
          {tabActiva === 'transacciones' && (
            <motion.div
              key="transacciones"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <div className="section-header">
                <p className="section-eyebrow">// CRUD Completo</p>
                <h1 className="section-title">Transacciones</h1>
                <p className="section-subtitle">Gestiona ingresos, gastos e inversiones en tiempo real</p>
              </div>
              <div className="glass" style={{ padding: '1.5rem' }}>
                <TablaTransacciones />
              </div>
            </motion.div>
          )}

          {/* ═══ TAB: PRESUPUESTO ═══ */}
          {tabActiva === 'presupuesto' && (
            <motion.div
              key="presupuesto"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <div className="section-header">
                <p className="section-eyebrow">// Control de Gastos</p>
                <h1 className="section-title">Presupuesto</h1>
                <p className="section-subtitle">Monitorea metas vs ejecución real por categoría</p>
              </div>
              <div className="glass" style={{ padding: '1.5rem' }}>
                <PanelPresupuesto />
              </div>
            </motion.div>
          )}

          {/* ═══ TAB: REPORTE ═══ */}
          {tabActiva === 'reporte' && (
            <motion.div
              key="reporte"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <div className="section-header">
                <p className="section-eyebrow">// Análisis Ejecutivo</p>
                <h1 className="section-title">Reporte del Período</h1>
                <p className="section-subtitle">Resumen consolidado con exportación CSV</p>
              </div>
              <div className="glass" style={{ padding: '1.75rem' }}>
                <PanelReporte />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default PanelPrincipal;
