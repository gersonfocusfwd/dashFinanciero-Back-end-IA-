import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Activity, AlertCircle, Terminal, Zap, ChevronRight } from 'lucide-react';
import '../estilos/Dashboard.css';

const AnalisisIA = ({ kpisCalculados }) => {
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [fase, setFase] = useState('');

  /**
   * Especialista en Prompt Engineering:
   * Prepara los datos y simula el envío a una API de IA con un prompt estructurado.
   */
  const enviarDatosAIA = () => {
    setAnalizando(true);
    setResultado(null);

    const fases = ['Conectando con API…', 'Procesando KPIs…', 'Detectando anomalías…', 'Generando insights…'];
    let i = 0;
    setFase(fases[0]);
    const intervalo = setInterval(() => {
      i++;
      if (i < fases.length) setFase(fases[i]);
      else clearInterval(intervalo);
    }, 600);

    const datosParaIA = {
      kpis: kpisCalculados,
      metadata: { timestamp: new Date().toISOString(), modelo: 'Claude-3-Haiku' },
      prompt_interno: `
        Eres un Consultor Financiero Experto. Basándote en estos KPIs:
        - Margen Bruto: ${kpisCalculados.margenBruto.toFixed(2)}
        - ROI: ${kpisCalculados.roi.toFixed(2)}%
        - Punto de Equilibrio: ${kpisCalculados.puntoEquilibrio.toFixed(0)} unidades
        Genera: resumen_ejecutivo, deteccion_anomalias, sugerencias_mejora.
      `,
    };

    console.log('Enviando Prompt Estructurado a la API…', datosParaIA.prompt_interno);

    setTimeout(() => {
      clearInterval(intervalo);
      const respuestaSimulada = {
        resumen_ejecutivo:
          kpisCalculados.margenBruto > 0.4
            ? 'La estructura de costos actual permite una alta rentabilidad operativa. El negocio es escalable.'
            : 'El margen bruto está por debajo del estándar industrial; riesgo alto de insolvencia si los costos variables suben.',
        deteccion_anomalias:
          kpisCalculados.puntoEquilibrio > 5000
            ? 'El punto de equilibrio es inusualmente alto en comparación con la capacidad instalada reportada.'
            : 'No se detectan discrepancias estadísticas significativas en los KPIs evaluados.',
        sugerencias_mejora: [
          'Negociar descuentos por volumen con proveedores para mejorar el margen bruto en un 5%.',
          'Diversificar la cartera de inversiones para mitigar la dependencia de beneficios netos volátiles.',
          'Implementar control de gastos fijos trimestral para reducir el punto de equilibrio.',
        ],
      };

      setResultado(respuestaSimulada);
      setAnalizando(false);
    }, 2800);
  };

  /* ── Animation configs ── */
  const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -15 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.12, duration: 0.35 },
    }),
  };

  return (
    <motion.div
      className="analisis-ia-container glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Header */}
      <div className="analisis-header">
        <div className="analisis-title-group">
          <Bot className="icon-ai" size={20} />
          <h2>Consultoría Gerencial IA</h2>
        </div>
        <button
          className="btn-primary"
          onClick={enviarDatosAIA}
          disabled={analizando}
          id="btn-analizar-ia"
        >
          {analizando
            ? <Activity className="spin" size={15} />
            : <Zap size={15} />}
          <span>{analizando ? 'Analizando…' : 'Analizar con IA'}</span>
        </button>
      </div>

      {/* Content area with animated states */}
      <div className="analisis-content">
        <AnimatePresence mode="wait">

          {/* ── Estado inicial ── */}
          {!resultado && !analizando && (
            <motion.div key="intro" className="analisis-intro" {...slideUp}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Terminal size={44} className="icon-muted" />
              </motion.div>
              <p>
                Presiona <strong style={{ color: 'var(--cyan)' }}>Analizar con IA</strong> para
                enviar los KPIs al motor de análisis y recibir recomendaciones estratégicas
                en tiempo real.
              </p>
            </motion.div>
          )}

          {/* ── Estado cargando ── */}
          {analizando && (
            <motion.div key="loader" className="analisis-loader" {...slideUp}>
              <div className="ai-pulse" />
              <motion.p
                key={fase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {fase}
              </motion.p>
              {/* Fake progress bar */}
              <motion.div
                style={{
                  width: '100%',
                  height: '3px',
                  borderRadius: '99px',
                  background: 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  marginTop: '0.5rem',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--cyan), var(--violet))',
                    borderRadius: '99px',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 2.6, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* ── Estado resultado ── */}
          {resultado && !analizando && (
            <motion.div key="output" className="analisis-output" {...slideUp}>

              {[
                {
                  key: 0,
                  icon: <Activity size={13} />,
                  titulo: 'Resumen Ejecutivo',
                  texto: resultado.resumen_ejecutivo,
                  clase: '',
                },
                {
                  key: 1,
                  icon: <AlertCircle size={13} />,
                  titulo: 'Detección de Anomalías',
                  texto: resultado.deteccion_anomalias,
                  clase: 'warning',
                },
                {
                  key: 2,
                  icon: <Sparkles size={13} />,
                  titulo: 'Sugerencias Estratégicas',
                  lista: resultado.sugerencias_mejora,
                  clase: 'suggestions',
                },
              ].map((sec) => (
                <motion.div
                  key={sec.key}
                  className={`ia-section ${sec.clase}`}
                  custom={sec.key}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3>
                    {sec.icon}
                    {sec.titulo}
                  </h3>
                  {sec.texto && <p>{sec.texto}</p>}
                  {sec.lista && (
                    <ul>
                      {sec.lista.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}

              {/* Re-run button */}
              <button
                className="btn-primary"
                onClick={enviarDatosAIA}
                style={{ alignSelf: 'flex-start', marginTop: '0.25rem', fontSize: '0.75rem', padding: '0.45rem 1rem' }}
                id="btn-volver-analizar"
              >
                <ChevronRight size={13} />
                <span>Volver a analizar</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AnalisisIA;
