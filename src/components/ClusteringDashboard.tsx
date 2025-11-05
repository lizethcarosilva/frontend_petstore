/**
 * CLUSTERING DASHBOARD
 * Componente React para visualizar análisis de clustering jerárquico
 */

import React, { useState, useEffect } from 'react';

interface ClusteringData {
  clustering_mascotas: {
    n_clusters: number;
    silhouette_score: number;
    total_mascotas: number;
    metodo: string;
    clusters: Array<{
      cluster_id: number;
      total_mascotas: number;
      edad_promedio: number;
      precio_promedio: number;
      tipo_mascota_predominante: string;
      distribucion_tipos: Record<string, number>;
    }>;
  };
  clustering_clientes: {
    n_segmentos: number;
    silhouette_score: number;
    total_clientes_analizados: number;
    calidad_clustering: string;
    segmentos: Array<{
      segmento_id: number;
      nombre: string;
      total_clientes: number;
      gasto_promedio: number;
      citas_promedio: number;
      tasa_asistencia_promedio: number;
      valor_total_segmento: number;
    }>;
  };
  clustering_servicios: {
    n_grupos: number;
    silhouette_score: number;
    total_servicios: number;
    grupos: Array<{
      grupo_id: number;
      total_servicios: number;
      uso_promedio: number;
      hora_promedio: number;
      tasa_asistencia_promedio: number;
      servicios: string[];
    }>;
  };
}

const ClusteringDashboard: React.FC = () => {
  const [data, setData] = useState<ClusteringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'clientes' | 'mascotas' | 'servicios'>('clientes');

  useEffect(() => {
    const fetchClustering = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/clustering/completo');
        
        if (!response.ok) {
          throw new Error('Error al cargar clustering');
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClustering();
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Analizando patrones con IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h3><i className="pi pi-exclamation-triangle"></i> Error al cargar clustering</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1><i className="pi pi-search"></i> Análisis de Hierarchical Clustering</h1>
        <p style={styles.subtitle}>
          Descubre patrones ocultos en tus datos con Machine Learning
        </p>
      </header>

      {/* Resumen de calidad */}
      <div style={styles.qualityCards}>
        <QualityCard
          icon="pi-star"
          title="Mascotas"
          clusters={data.clustering_mascotas.n_clusters}
          score={data.clustering_mascotas.silhouette_score}
          total={data.clustering_mascotas.total_mascotas}
        />
        <QualityCard
          icon="pi-users"
          title="Clientes"
          clusters={data.clustering_clientes.n_segmentos}
          score={data.clustering_clientes.silhouette_score}
          total={data.clustering_clientes.total_clientes_analizados}
          quality={data.clustering_clientes.calidad_clustering}
        />
        <QualityCard
          icon="pi-building"
          title="Servicios"
          clusters={data.clustering_servicios.n_grupos}
          score={data.clustering_servicios.silhouette_score}
          total={data.clustering_servicios.total_servicios}
        />
      </div>

      {/* Tabs de navegación */}
      <div style={styles.tabs}>
        <button
          style={vistaActiva === 'clientes' ? styles.tabActive : styles.tab}
          onClick={() => setVistaActiva('clientes')}
        >
          <i className="pi pi-users"></i> Clientes
        </button>
        <button
          style={vistaActiva === 'mascotas' ? styles.tabActive : styles.tab}
          onClick={() => setVistaActiva('mascotas')}
        >
          <i className="pi pi-star"></i> Mascotas
        </button>
        <button
          style={vistaActiva === 'servicios' ? styles.tabActive : styles.tab}
          onClick={() => setVistaActiva('servicios')}
        >
          <i className="pi pi-building"></i> Servicios
        </button>
      </div>

      {/* Contenido según vista activa */}
      <div style={styles.content}>
        {vistaActiva === 'clientes' && (
          <SegmentosClientes data={data.clustering_clientes} />
        )}
        {vistaActiva === 'mascotas' && (
          <ClustersMascotas data={data.clustering_mascotas} />
        )}
        {vistaActiva === 'servicios' && (
          <GruposServicios data={data.clustering_servicios} />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Tarjeta de Calidad
// ============================================================================
interface QualityCardProps {
  icon: string;
  title: string;
  clusters: number;
  score: number;
  total: number;
  quality?: string;
}

const QualityCard: React.FC<QualityCardProps> = ({ icon, title, clusters, score, total, quality }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return '#10b981'; // Verde
    if (score >= 0.5) return '#3b82f6'; // Azul
    if (score >= 0.3) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const getScoreText = (score: number) => {
    if (score >= 0.7) return 'Excelente';
    if (score >= 0.5) return 'Bueno';
    if (score >= 0.3) return 'Moderado';
    return 'Bajo';
  };

  return (
    <div style={styles.qualityCard}>
      <div style={styles.qualityIcon}><i className={`pi ${icon}`}></i></div>
      <h3 style={styles.qualityTitle}>{title}</h3>
      <div style={styles.qualityStats}>
        <div className="stat">
          <span className="label">{clusters} Clusters</span>
        </div>
        <div className="stat">
          <span className="label">{total} Items</span>
        </div>
        <div className="stat">
          <span 
            className="score" 
            style={{ color: getScoreColor(score) }}
          >
            Score: {score.toFixed(3)}
          </span>
        </div>
        <div className="quality-badge" style={{ 
          background: getScoreColor(score) + '20',
          color: getScoreColor(score)
        }}>
          {quality || getScoreText(score)}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Segmentos de Clientes
// ============================================================================
const SegmentosClientes: React.FC<{ data: ClusteringData['clustering_clientes'] }> = ({ data }) => {
  if (!data || !data.segmentos) return null;

  // Ordenar por gasto promedio
  const segmentosOrdenados = [...data.segmentos].sort(
    (a, b) => b.gasto_promedio - a.gasto_promedio
  );

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <i className="pi pi-users"></i> Segmentación de Clientes - {data.calidad_clustering}
      </h2>
      <p style={styles.sectionSubtitle}>
        {data.total_clientes_analizados} clientes analizados | 
        Silhouette Score: {data.silhouette_score.toFixed(3)}
      </p>

      <div style={styles.segmentosGrid}>
        {segmentosOrdenados.map((segmento, index) => (
          <div key={segmento.segmento_id} style={{
            ...styles.segmentoCard,
            borderLeft: `4px solid ${getSegmentoColor(index)}`
          }}>
            <div style={styles.segmentoHeader}>
              <h3 style={styles.segmentoNombre}>{segmento.nombre}</h3>
              <span style={styles.segmentoRank}>#{index + 1}</span>
            </div>

            <div style={styles.segmentoStats}>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Clientes</span>
                <span style={styles.statValue}>{segmento.total_clientes}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Gasto promedio</span>
                <span style={styles.statValue}>${segmento.gasto_promedio.toFixed(2)}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Citas promedio</span>
                <span style={styles.statValue}>{segmento.citas_promedio.toFixed(1)}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Tasa asistencia</span>
                <span style={styles.statValue}>{(segmento.tasa_asistencia_promedio * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div style={styles.valorTotal}>
              <span>Valor total del segmento</span>
              <strong>${segmento.valor_total_segmento.toFixed(2)}</strong>
            </div>

            {/* Estrategia sugerida */}
            <div style={styles.estrategia}>
              <small><i className="pi pi-lightbulb"></i> Estrategia:</small>
              <p>{getEstrategia(segmento.nombre)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Clusters de Mascotas
// ============================================================================
const ClustersMascotas: React.FC<{ data: ClusteringData['clustering_mascotas'] }> = ({ data }) => {
  if (!data || !data.clusters) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <i className="pi pi-star"></i> Clusters de Mascotas
      </h2>
      <p style={styles.sectionSubtitle}>
        {data.total_mascotas} mascotas analizadas | 
        Silhouette Score: {data.silhouette_score.toFixed(3)} | 
        Método: {data.metodo}
      </p>

      <div style={styles.clustersGrid}>
        {data.clusters.map(cluster => (
          <div key={cluster.cluster_id} style={styles.clusterCard}>
            <div style={styles.clusterHeader}>
              <h3>Cluster {cluster.cluster_id}</h3>
              <span style={styles.badge}>{cluster.total_mascotas} mascotas</span>
            </div>

            <div style={styles.clusterStats}>
              <div style={styles.statItem}>
                <span className="icon"><i className="pi pi-calendar"></i></span>
                <div>
                  <small>Edad promedio</small>
                  <strong>{cluster.edad_promedio.toFixed(1)} años</strong>
                </div>
              </div>

              <div style={styles.statItem}>
                <span className="icon"><i className="pi pi-dollar"></i></span>
                <div>
                  <small>Precio promedio</small>
                  <strong>${cluster.precio_promedio.toFixed(2)}</strong>
                </div>
              </div>

              <div style={styles.statItem}>
                <span className="icon"><i className="pi pi-star"></i></span>
                <div>
                  <small>Tipo predominante</small>
                  <strong>{cluster.tipo_mascota_predominante}</strong>
                </div>
              </div>
            </div>

            {/* Distribución de tipos */}
            <div style={styles.distribucion}>
              <small style={{ color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Distribución de tipos:
              </small>
              {Object.entries(cluster.distribucion_tipos).map(([tipo, cantidad]) => (
                <div key={tipo} style={styles.distribucionItem}>
                  <span>{tipo}</span>
                  <span style={styles.distribucionBadge}>{cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: Grupos de Servicios
// ============================================================================
const GruposServicios: React.FC<{ data: ClusteringData['clustering_servicios'] }> = ({ data }) => {
  if (!data || !data.grupos) return null;

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        <i className="pi pi-building"></i> Agrupación de Servicios
      </h2>
      <p style={styles.sectionSubtitle}>
        {data.total_servicios} servicios analizados | 
        Silhouette Score: {data.silhouette_score.toFixed(3)}
      </p>

      <div style={styles.serviciosGrid}>
        {data.grupos.map(grupo => (
          <div key={grupo.grupo_id} style={styles.grupoCard}>
            <div style={styles.grupoHeader}>
              <h3>Grupo {grupo.grupo_id}</h3>
              <span style={styles.badge}>{grupo.total_servicios} servicios</span>
            </div>

            <div style={styles.grupoMetrics}>
              <div style={styles.metricBox}>
                <span style={styles.metricLabel}>Uso promedio</span>
                <span style={styles.metricValue}>{grupo.uso_promedio.toFixed(1)}</span>
              </div>
              <div style={styles.metricBox}>
                <span style={styles.metricLabel}>Hora promedio</span>
                <span style={styles.metricValue}>{grupo.hora_promedio.toFixed(0)}:00</span>
              </div>
              <div style={styles.metricBox}>
                <span style={styles.metricLabel}>Asistencia</span>
                <span style={styles.metricValue}>
                  {(grupo.tasa_asistencia_promedio * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div style={styles.serviciosList}>
              <small style={{ color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Servicios en este grupo:
              </small>
              <ul style={styles.ul}>
                {grupo.servicios.map((servicio, idx) => (
                  <li key={idx}>{servicio}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

const getSegmentoColor = (index: number) => {
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
  return colors[index % colors.length];
};

const getEstrategia = (nombreSegmento: string) => {
  if (nombreSegmento.includes('VIP')) {
    return 'Programa de lealtad, descuentos exclusivos, atención prioritaria';
  } else if (nombreSegmento.includes('Regular')) {
    return 'Mantener satisfacción, recordatorios automáticos, ofertas especiales';
  } else if (nombreSegmento.includes('Ocasional')) {
    return 'Campañas de reactivación, ofertas atractivas, seguimiento personalizado';
  } else if (nombreSegmento.includes('Nuevo')) {
    return 'Onboarding efectivo, descuentos de bienvenida, fidelización temprana';
  }
  return 'Análisis y seguimiento personalizado';
};

// ============================================================================
// ESTILOS
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  subtitle: {
    color: '#64748b',
    margin: '8px 0 0 0'
  },
  qualityCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  qualityCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  qualityIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  qualityTitle: {
    margin: '0 0 16px 0',
    color: '#1e293b',
    fontSize: '18px'
  },
  qualityStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    background: 'white',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tab: {
    flex: 1,
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  tabActive: {
    flex: 1,
    padding: '12px 24px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    transition: 'all 0.2s'
  },
  content: {
    marginTop: '20px'
  },
  section: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    color: '#1e293b'
  },
  sectionSubtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 24px 0'
  },
  segmentosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  segmentoCard: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '10px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  segmentoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  segmentoNombre: {
    margin: 0,
    fontSize: '18px',
    color: '#1e293b'
  },
  segmentoRank: {
    background: '#e2e8f0',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#475569'
  },
  segmentoStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  statLabel: {
    color: '#64748b',
    fontSize: '14px'
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1e293b',
    fontSize: '16px'
  },
  valorTotal: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  estrategia: {
    background: '#eff6ff',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e40af'
  },
  clustersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  clusterCard: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0'
  },
  clusterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  badge: {
    background: '#e2e8f0',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  clusterStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  statItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px'
  },
  distribucion: {
    marginTop: '16px',
    padding: '12px',
    background: 'white',
    borderRadius: '8px'
  },
  distribucionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0'
  },
  distribucionBadge: {
    background: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  serviciosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  },
  grupoCard: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0'
  },
  grupoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  grupoMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  metricBox: {
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  metricLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
    marginBottom: '4px'
  },
  metricValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  serviciosList: {
    background: 'white',
    padding: '12px',
    borderRadius: '8px'
  },
  ul: {
    margin: 0,
    paddingLeft: '20px',
    color: '#475569'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  error: {
    padding: '40px',
    textAlign: 'center',
    background: '#fef2f2',
    borderRadius: '12px',
    margin: '20px',
    color: '#991b1b'
  }
};

// Agregar animación del spinner
if (typeof document !== 'undefined') {
  const existingStyle = document.head.querySelector('style[data-clustering]');
  if (!existingStyle) {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .segmento-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
      }
    `;
    styleSheet.setAttribute('data-clustering', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ClusteringDashboard;

