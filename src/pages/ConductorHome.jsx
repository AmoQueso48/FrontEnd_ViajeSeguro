import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Boton from '../components/Boton';
import imagenViaje from '../assets/viaje.jpg';
import { obtenerViajes, reportarNovedad } from '../services/api';

const tiposDeNovedad = [
  'Retraso',
  'Falla mecánica',
  'Accidente o incidente',
  'Problema con pasajeros',
  'Otro',
];

export default function ConductorHome() {
  const [viajeAsignado, setViajeAsignado] = useState(null);
  const [cargandoViaje, setCargandoViaje] = useState(true);

  const [tipoNovedad, setTipoNovedad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviandoReporte, setEnviandoReporte] = useState(false);

  useEffect(() => {
    const cargarViajeConductor = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const viajes = await obtenerViajes();

        if (Array.isArray(viajes) && viajes.length > 0) {
          // Buscamos el viaje asignado a este conductor (o el primero activo si es demo)
          const miViaje =
            viajes.find((v) => v.conductor?.id === usuario.id && v.estado !== 'FINALIZADO') ||
            viajes.find((v) => v.conductor?.id === usuario.id) ||
            viajes[0];
          setViajeAsignado(miViaje);
        }
      } catch (error) {
        console.error('Error al cargar orden de viaje:', error);
      } finally {
        setCargandoViaje(false);
      }
    };

    cargarViajeConductor();
  }, []);

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return 'Por confirmar';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-CL', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' hrs';
  };

  const ordenDeViaje = viajeAsignado
    ? [
        {
          etiqueta: 'Vehículo',
          valor: viajeAsignado.vehiculo
            ? `${viajeAsignado.vehiculo.patente} · ${viajeAsignado.vehiculo.modelo}`
            : 'Sin vehículo asignado',
        },
        {
          etiqueta: 'Cliente',
          valor: viajeAsignado.cliente?.nombreCompleto || 'Cliente registrado',
        },
        { etiqueta: 'Origen', valor: viajeAsignado.origen },
        { etiqueta: 'Destino', valor: viajeAsignado.destino },
        { etiqueta: 'Horario', valor: formatearFecha(viajeAsignado.fechaHora) },
        {
          etiqueta: 'Servicio',
          valor: `${viajeAsignado.tipoServicio} (${viajeAsignado.cantidadPasajeros} pasajeros)`,
        },
      ]
    : [];

  const handleReporteSubmit = async (e) => {
    e.preventDefault();

    if (!tipoNovedad || !descripcion.trim()) {
      alert('⚠️ Por favor completa todos los campos para enviar el reporte.');
      return;
    }

    if (!viajeAsignado?.id) {
      alert('⚠️ No tienes un viaje asignado activo para asociar la novedad.');
      return;
    }

    setEnviandoReporte(true);
    try {
      await reportarNovedad({
        viajeId: viajeAsignado.id,
        tipoNovedad,
        descripcion: descripcion.trim(),
      });

      alert('¡Reporte enviado con éxito y registrado en el sistema!');
      setTipoNovedad('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al enviar novedad:', error);
      alert('❌ Ocurrió un error al enviar el reporte. Verifica tu sesión.');
    } finally {
      setEnviandoReporte(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      {/* ==================== TÍTULO ==================== */}
      <div className="pp-hero mb-4">
        <div className="container">
          <h1 className="fw-bold mb-2">Tu próximo viaje</h1>
          <p className="lead m-0">
            Revisa el detalle de tu próxima orden de viaje y repórtanos cualquier novedad durante el trayecto
          </p>
        </div>
      </div>

      <main className="flex-grow-1">
        <div className="container pb-4">

          {/* ==================== ORDEN DE VIAJE + IMAGEN ==================== */}
          <div className="row g-4 align-items-center mt-1">
            <div className="col-md-6">
              <div className="card p-4 shadow-sm pp-card-accent">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 fw-bold m-0">Orden de viaje asignada</h2>
                  {viajeAsignado && (
                    <span className="badge bg-primary">{viajeAsignado.estado}</span>
                  )}
                </div>

                {cargandoViaje ? (
                  <p className="text-muted mb-0">Cargando orden de viaje...</p>
                ) : ordenDeViaje.length > 0 ? (
                  <table className="table table-sm mb-0 pp-ticket">
                    <tbody>
                      {ordenDeViaje.map((fila) => (
                        <tr key={fila.etiqueta}>
                          <th scope="row" className="fw-normal text-muted py-2">{fila.etiqueta}</th>
                          <td className="text-end fw-semibold py-2">{fila.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted mb-0">No tienes viajes asignados actualmente.</p>
                )}
              </div>
            </div>

            {/* Imagen de Farellones / Cordillera */}
            <div className="col-md-6">
              <div className="card shadow-sm border-0 overflow-hidden">
                <img
                  src={imagenViaje}
                  alt="Vista de la cordillera desde la ventana del bus"
                  className="card-img-top object-fit-cover"
                  style={{ height: '320px' }}
                />
              </div>
            </div>
          </div>

          {/* ==================== REPORTAR UNA NOVEDAD ==================== */}
          <section className="mt-5">
            <div className="card p-4 shadow-sm border-0">
              <h2 className="h4 fw-semibold mb-3">Reportar una novedad</h2>
              <form onSubmit={handleReporteSubmit}>
                <div className="mb-3">
                  <label htmlFor="tipoNovedad" className="form-label fw-medium">Tipo de novedad</label>
                  <select
                    id="tipoNovedad"
                    className="form-select"
                    value={tipoNovedad}
                    onChange={(e) => setTipoNovedad(e.target.value)}
                    required
                  >
                    <option value="" disabled>Selecciona una opción</option>
                    {tiposDeNovedad.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label fw-medium">Cuéntanos qué ocurrió</label>
                  <textarea
                    id="descripcion"
                    className="form-control"
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente la situación"
                    required
                  />
                </div>

                <Boton
                  texto={enviandoReporte ? 'Enviando...' : 'Enviar reporte'}
                  type="submit"
                  variant="danger"
                />
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}