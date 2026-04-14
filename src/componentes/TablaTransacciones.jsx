import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTransacciones, crearTransaccion, eliminarTransaccion } from '../servicios/apiServicio';
import { Trash2, Plus, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import '../estilos/Dashboard.css';

const TablaTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    esInversion: false,
    esCostoDirecto: false,
    esFijo: false,
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ''
  });

  const cargarDatos = async () => {
    try {
      const data = await getTransacciones();
      setTransacciones(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar esta transacción?')) return;
    await eliminarTransaccion(id);
    cargarDatos();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearTransaccion({
      ...formData,
      monto: Number(formData.monto)
    });
    setShowForm(false);
    cargarDatos();
    setFormData({ ...formData, categoria: '', monto: '', descripcion: '' }); // reset basic info
  };

  if (loading) return <div className="loader">Cargando datos...</div>;

  return (
    <div className="section-container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Registro de Operaciones</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Volver a la tabla' : <><Plus size={16} /> Nueva Transacción</>}
        </button>
      </div>

      {showForm ? (
        <motion.form 
          onSubmit={handleSubmit}
          className="glass"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', borderRadius: '16px' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto (Usa negativo para gastos)</label>
              <input 
                type="number" 
                required
                value={formData.monto}
                onChange={e => setFormData({ ...formData, monto: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha</label>
              <input 
                type="date" 
                required
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categoría (Ej: Ventas, Sueldos)</label>
              <input 
                type="text" 
                required
                value={formData.categoria}
                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descripción</label>
              <input 
                type="text" 
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={formData.esInversion} onChange={e => setFormData({...formData, esInversion: e.target.checked})} />
                Es Inversión
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={formData.esCostoDirecto} onChange={e => setFormData({...formData, esCostoDirecto: e.target.checked})} />
                Es Costo Directo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={formData.esFijo} onChange={e => setFormData({...formData, esFijo: e.target.checked})} />
                Es Gasto Fijo
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Guardar Transacción</button>
        </motion.form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {transacciones.map((t, idx) => (
            <motion.div 
              key={t.id}
              className="glass"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', transition: 'all 0.2s' }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  background: t.monto > 0 ? 'var(--green-dim)' : 'var(--pink-dim)',
                  color: t.monto > 0 ? 'var(--green)' : 'var(--pink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {t.monto > 0 ? <ArrowUpRight /> : <ArrowDownRight />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.categoria}</h4>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>{t.fecha}</span>
                    <span>·</span>
                    <span>{t.descripcion || 'Sin descripción'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span style={{ 
                  fontSize: '1.15rem', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-mono)',
                  color: t.monto > 0 ? 'var(--green)' : 'var(--text-primary)'
                }}>
                  {t.monto > 0 ? '+' : '-'}${Math.abs(t.monto).toLocaleString()}
                </span>
                <button onClick={() => handleDelete(t.id)} style={{ background: 'transparent', color: 'var(--pink)', opacity: 0.6 }} title="Eliminar">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TablaTransacciones;
