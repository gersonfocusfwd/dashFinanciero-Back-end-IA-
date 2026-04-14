import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import '../estilos/Dashboard.css';

const GraficoComparativo = ({ datos }) => {
  // Construir 6 meses ficticios con distribución realista basada en datos reales
  const base = datos.ingresos / 6;
  const dataParaGrafico = [
    { mes: 'Ene', ingresos: +(base * 0.72).toFixed(0), gastos: +(base * 0.60).toFixed(0), utilidad: +(base * 0.12).toFixed(0) },
    { mes: 'Feb', ingresos: +(base * 0.85).toFixed(0), gastos: +(base * 0.68).toFixed(0), utilidad: +(base * 0.17).toFixed(0) },
    { mes: 'Mar', ingresos: +(base * 0.90).toFixed(0), gastos: +(base * 0.71).toFixed(0), utilidad: +(base * 0.19).toFixed(0) },
    { mes: 'Abr', ingresos: +(base * 1.05).toFixed(0), gastos: +(base * 0.78).toFixed(0), utilidad: +(base * 0.27).toFixed(0) },
    { mes: 'May', ingresos: +(base * 1.12).toFixed(0), gastos: +(base * 0.82).toFixed(0), utilidad: +(base * 0.30).toFixed(0) },
    { mes: 'Jun', ingresos: +(base * 1.20).toFixed(0), gastos: +(base * 0.85).toFixed(0), utilidad: +(datos.utilidadNeta).toFixed(0) },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(8,15,30,0.95)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '10px',
        padding: '0.85rem 1.1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.78rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, marginBottom: '0.2rem' }}>
            {p.name}: <strong>${(p.value / 1000).toFixed(1)}k</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="grafico-container glass"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="grafico-header">
        <h3 className="grafico-titulo">Tendencia de Rendimiento — 6 Meses</h3>
        <span className="grafico-badge">AREA CHART</span>
      </div>

      <div style={{ width: '100%', height: 310 }}>
        <ResponsiveContainer>
          <AreaChart data={dataParaGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f8e" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#f43f8e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradUtilidad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00ffa3" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00ffa3" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,212,255,0.06)"
            />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4a647f', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4a647f', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#gradIngresos)"
              dot={{ fill: '#00d4ff', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }}
            />
            <Area
              type="monotone"
              dataKey="gastos"
              name="Gastos"
              stroke="#f43f8e"
              strokeWidth={2}
              fill="url(#gradGastos)"
              dot={{ fill: '#f43f8e', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#f43f8e' }}
            />
            <Area
              type="monotone"
              dataKey="utilidad"
              name="Utilidad"
              stroke="#00ffa3"
              strokeWidth={2}
              fill="url(#gradUtilidad)"
              dot={{ fill: '#00ffa3', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#00ffa3' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        {[
          { label: 'Ingresos', color: '#00d4ff' },
          { label: 'Gastos',   color: '#f43f8e' },
          { label: 'Utilidad', color: '#00ffa3' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default GraficoComparativo;
