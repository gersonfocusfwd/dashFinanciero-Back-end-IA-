import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Target, DollarSign, BarChart2 } from 'lucide-react';
import '../estilos/KpiCard.css';

// Mapeo de iconos por título
const iconMap = {
  'Margen Bruto': BarChart2,
  'ROI': TrendingUp,
  'Punto de Equilibrio': Target,
  'Utilidad Neta': DollarSign,
};

const KpiCard = ({ titulo, valor, simbolo, descripcion, color, colorDim, index = 0 }) => {
  const barRef = useRef(null);
  const IconComponent = iconMap[titulo] || Activity;

  // Animar la barra al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (barRef.current) {
        const random = 45 + Math.random() * 50; // barra visual entre 45-95%
        barRef.current.style.width = `${random}%`;
      }
    }, 600 + index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      className="kpi-card glass glow-border"
      style={{
        '--kpi-color': color,
        '--kpi-dim': colorDim || `${color}20`,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 12px 40px ${color}22`,
      }}
    >
      {/* Top row: label + icon */}
      <div className="kpi-top">
        <span className="kpi-label">{titulo}</span>
        <div className="kpi-icon-wrap">
          <IconComponent size={16} strokeWidth={2.5} />
        </div>
      </div>

      {/* Main value */}
      <div className="kpi-value-row">
        <span className="kpi-symbol">{simbolo}</span>
        <motion.span
          className="kpi-value"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
        >
          {valor}
        </motion.span>
      </div>

      <p className="kpi-description">{descripcion}</p>

      {/* Bottom progress bar */}
      <div className="kpi-bar-track">
        <div className="kpi-bar-fill" ref={barRef} />
      </div>
    </motion.div>
  );
};

export default KpiCard;
