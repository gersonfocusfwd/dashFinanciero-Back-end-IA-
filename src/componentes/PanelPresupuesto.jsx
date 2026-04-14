import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import {
  obtenerPresupuesto, crearPresupuesto, eliminarPresupuesto,
} from '../servicios/apiServicio';
import '../estilos/Presupuesto.css';
import '../estilos/Tabla.css';  // reutiliza form-input y btn-primary

const PanelPresupuesto = () => {
  const [presupuesto, setPresupuesto]   = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState('');
  const [form, setForm]                 = useState({ categoria: '', limite: '', descripcion: '' });
  const [guardando, setGuardando]       = useState(false);
  const barRefs                         = useRef({});

  const cargar = async () => {
    setCargando(true); setError('');
    try {
      const resp = await obtenerPresupuesto();
      setPresupuesto(resp.data);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  // Animar barras al montar
  useEffect(() => {
    presupuesto.forEach(item => {
      const el = barRefs.current[item.id];
      if (el) {
        setTimeout(() => {
          el.style.width = `${Math.min(item.porcentaje, 100)}%`;
        }, 200);
      }
    });
  }, [presupuesto]);

  const handleAgregar = async () => {
    if (!form.categoria || !form.limite) return;
    setGuardando(true);
    try {
      await crearPresupuesto({ ...form, limite: Number(form.limite) });
      setForm({ categoria: '', limite: '', descripcion: '' });
      cargar();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta meta de presupuesto?')) return;
    try {
      await eliminarPresupuesto(id);
      cargar();
    } catch (e) { setError(e.message); }
  };

  const iconoEstado = (estado) => {
    if (estado === 'ok')       return <CheckCircle2 size={11} />;
    if (estado === 'alerta')   return <AlertTriangle size={11} />;
    if (estado === 'excedido') return <XCircle size={11} />;
  };

  if (cargando) return <div className="tabla-loading">Cargando presupuesto…</div>;
  if (error)    return <div className="tabla-error">⚠️ {error}</div>;

  return (
    <div className="presupuesto-grid">
      <AnimatePresence>
        {presupuesto.map((item, i) => (
          <motion.div
            key={item.id}
            className={`presupuesto-card ${item.estado}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="presupuesto-top">
              <div>
                <p className="presupuesto-nombre">{item.categoria}</p>
                {item.descripcion && <p className="presupuesto-desc">{item.descripcion}</p>}
              </div>
              <span className={`presupuesto-estado estado-${item.estado}`}>
                {iconoEstado(item.estado)}
                {item.estado.toUpperCase()}
              </span>
            </div>

            <div className="presupuesto-montos">
              <div className="monto-info">
                <span className="monto-info-label">Gastado</span>
                <span className="monto-info-value gastado">${item.gastado.toLocaleString()}</span>
              </div>
              <div className="monto-info">
                <span className="monto-info-label">Límite</span>
                <span className="monto-info-value limite">${item.limite.toLocaleString()}</span>
              </div>
              <div className="monto-info">
                <span className="monto-info-label">Uso</span>
                <span className="monto-info-value pct">{item.porcentaje}%</span>
              </div>
            </div>

            <div className="presupuesto-bar-track">
              <div
                ref={el => barRefs.current[item.id] = el}
                className={`presupuesto-bar-fill fill-${item.estado}`}
                style={{ width: '0%' }}
              />
            </div>

            <div className="presupuesto-acciones">
              <button className="btn-icon trash" onClick={() => handleEliminar(item.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Agregar nueva meta */}
      <div className="presupuesto-nuevo">
        <p className="presupuesto-nuevo-title">+ Agregar Meta de Presupuesto</p>
        <div className="presupuesto-form-row">
          <input
            className="form-input"
            placeholder="Categoría"
            value={form.categoria}
            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Límite $"
            value={form.limite}
            onChange={e => setForm(f => ({ ...f, limite: e.target.value }))}
          />
          <input
            className="form-input"
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          />
          <button className="btn-primary" onClick={handleAgregar} disabled={guardando} id="btn-agregar-presupuesto">
            {guardando ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelPresupuesto;
