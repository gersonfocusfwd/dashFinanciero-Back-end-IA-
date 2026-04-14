import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Layers, RefreshCw, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  obtenerTransacciones, crearTransaccion, actualizarTransaccion, eliminarTransaccion,
} from '../servicios/apiServicio';
import '../estilos/Tabla.css';

const ITEMS_POR_PAGINA = 5;

const FILTROS = [
  { id: '',          label: 'Todos',    icon: <Layers size={12} />,      activeClass: 'active' },
  { id: 'ingreso',   label: 'Ingresos', icon: <TrendingUp size={12} />,  activeClass: 'active' },
  { id: 'gasto',     label: 'Gastos',   icon: <TrendingDown size={12} />,activeClass: 'active-gasto' },
  { id: 'inversion', label: 'Inversión',icon: <Layers size={12} />,      activeClass: 'active-inversion' },
];

const FORM_VACIO = {
  categoria: '', monto: '', descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  esInversion: false, esCostoDirecto: false, esFijo: false,
};

/* ── Subcomponente: Modal formulario ─────────────────────────── */
const ModalTransaccion = ({ transaccion, onGuardar, onCerrar, cargando }) => {
  const [form, setForm] = useState(transaccion || FORM_VACIO);

  const actualizar = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const enviar = () => {
    if (!form.categoria || !form.monto) return;
    onGuardar(form);
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="modal-header">
          <h3>{transaccion?.id ? 'Editar Transacción' : 'Nueva Transacción'}</h3>
          <button className="modal-close" onClick={onCerrar}><X size={16} /></button>
        </div>

        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Categoría *</label>
            <input
              className="form-input"
              placeholder="Ej: Ventas Software"
              value={form.categoria}
              onChange={e => actualizar('categoria', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Monto $ *</label>
            <input
              className="form-input"
              type="number"
              placeholder="Positivo = ingreso, Negativo = gasto"
              value={form.monto}
              onChange={e => actualizar('monto', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Fecha</label>
            <input
              className="form-input"
              type="date"
              value={form.fecha}
              onChange={e => actualizar('fecha', e.target.value)}
            />
          </div>
          <div className="form-field full">
            <label className="form-label">Descripción</label>
            <input
              className="form-input"
              placeholder="Descripción opcional..."
              value={form.descripcion}
              onChange={e => actualizar('descripcion', e.target.value)}
            />
          </div>
        </div>

        <div className="form-checkbox-row">
          {[
            { campo: 'esInversion',   label: '📈 Es Inversión' },
            { campo: 'esCostoDirecto', label: '⚙️ Costo Directo' },
            { campo: 'esFijo',        label: '🔒 Gasto Fijo' },
          ].map(({ campo, label }) => (
            <label key={campo} className="form-checkbox-label">
              <input
                type="checkbox"
                checked={form[campo]}
                onChange={e => actualizar(campo, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn-cancel" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primary" onClick={enviar} disabled={cargando}>
            {cargando ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
            <span>{cargando ? 'Guardando…' : 'Guardar'}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Componente principal ────────────────────────────────────── */
const TablaTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState('');
  const [busqueda, setBusqueda]           = useState('');
  const [filtroTipo, setFiltroTipo]       = useState('');
  const [pagina, setPagina]               = useState(1);
  const [modalAbierto, setModalAbierto]   = useState(false);
  const [editando, setEditando]           = useState(null);
  const [guardando, setGuardando]         = useState(false);
  const [toast, setToast]                 = useState(null);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargarTransacciones = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const filtros = {};
      if (filtroTipo)   filtros.tipo = filtroTipo;
      if (busqueda)     filtros.q    = busqueda;
      const resp = await obtenerTransacciones(filtros);
      setTransacciones(resp.data);
      setPagina(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [filtroTipo, busqueda]);

  useEffect(() => {
    const id = setTimeout(cargarTransacciones, 300);
    return () => clearTimeout(id);
  }, [cargarTransacciones]);

  const handleGuardar = async (form) => {
    setGuardando(true);
    try {
      if (editando?.id) {
        await actualizarTransaccion(editando.id, form);
        mostrarToast('Transacción actualizada ✔');
      } else {
        await crearTransaccion(form);
        mostrarToast('Transacción creada ✔');
      }
      setModalAbierto(false);
      setEditando(null);
      cargarTransacciones();
    } catch (e) {
      mostrarToast(`Error: ${e.message}`, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta transacción?')) return;
    try {
      await eliminarTransaccion(id);
      mostrarToast('Eliminada correctamente');
      cargarTransacciones();
    } catch (e) {
      mostrarToast(`Error: ${e.message}`, 'error');
    }
  };

  const tipoTx = (t) => {
    if (t.esInversion) return 'inversion';
    return t.monto > 0 ? 'ingreso' : 'gasto';
  };

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(transacciones.length / ITEMS_POR_PAGINA));
  const paginadas = transacciones.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

  return (
    <div className="tabla-wrapper">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '80px', right: '2rem', zIndex: 300,
              background: toast.tipo === 'error' ? 'rgba(244,63,142,0.15)' : 'rgba(0,255,163,0.12)',
              border: `1px solid ${toast.tipo === 'error' ? 'var(--pink)' : 'var(--green)'}`,
              borderRadius: 'var(--radius-md)', padding: '0.7rem 1.25rem',
              color: toast.tipo === 'error' ? 'var(--pink)' : 'var(--green)',
              fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            {toast.tipo === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="tabla-toolbar">
        <div className="tabla-search-wrap">
          <Search size={14} />
          <input
            className="tabla-search"
            placeholder="Buscar por categoría o descripción…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="tabla-filter-btns">
          {FILTROS.map(f => (
            <button
              key={f.id}
              className={`filter-btn ${filtroTipo === f.id ? f.activeClass : ''}`}
              onClick={() => setFiltroTipo(f.id)}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => { setEditando(null); setModalAbierto(true); }}
          id="btn-nueva-transaccion"
        >
          <Plus size={15} />
          <span>Nueva</span>
        </button>
      </div>

      {/* Table */}
      {cargando ? (
        <div className="tabla-loading">Cargando desde el servidor…</div>
      ) : error ? (
        <div className="tabla-error">⚠️ {error}</div>
      ) : (
        <>
          <div className="tabla-scroll">
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Monto ($)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginadas.length === 0 ? (
                    <tr><td colSpan={6} className="tabla-empty">No se encontraron transacciones</td></tr>
                  ) : paginadas.map((tx, i) => {
                    const tipo = tipoTx(tx);
                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <td className="cat-cell">{tx.categoria}</td>
                        <td className="desc-cell">{tx.descripcion || '—'}</td>
                        <td className="fecha-cell">{tx.fecha || '—'}</td>
                        <td>
                          <span className={`tipo-badge tipo-${tipo}`}>
                            {tipo === 'ingreso' && <TrendingUp size={11} />}
                            {tipo === 'gasto'   && <TrendingDown size={11} />}
                            {tipo === 'inversion' && <Layers size={11} />}
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={tx.monto > 0 ? 'monto-positivo' : 'monto-negativo'}>
                            {tx.monto > 0 ? '+' : ''}{tx.monto.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div className="acciones-cell">
                            <button className="btn-icon edit" onClick={() => { setEditando(tx); setModalAbierto(true); }}>
                              <Pencil size={13} />
                            </button>
                            <button className="btn-icon trash" onClick={() => handleEliminar(tx.id)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="tabla-pagination">
            <span>{transacciones.length} transacción{transacciones.length !== 1 ? 'es' : ''}</span>
            <div className="pag-btns">
              <button className="pag-btn" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i}
                  className={`pag-btn ${pagina === i + 1 ? 'active' : ''}`}
                  onClick={() => setPagina(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pag-btn" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalAbierto && (
          <ModalTransaccion
            transaccion={editando}
            onGuardar={handleGuardar}
            onCerrar={() => { setModalAbierto(false); setEditando(null); }}
            cargando={guardando}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TablaTransacciones;
