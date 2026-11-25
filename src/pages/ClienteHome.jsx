import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { crearViaje, obtenerMisViajes, calificarViaje } from '../services/api';

export default function ClienteHome() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [pasajeros, setPasajeros] = useState('');
  const [servicio, setServicio] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [misViajes, setMisViajes] = useState([]);
  const [cargandoViajes, setCargandoViajes] = useState(true);

  const cargarMisViajes = async () => {
    try {
      const viajes = await obtenerMisViajes();
      if (Array.isArray(viajes)) {
        setMisViajes(viajes);
      }
    } catch (error) {
      console.error('Error al cargar viajes del cliente:', error);
    } finally {
      setCargandoViajes(false);
    }
  };

  useEffect(() => {
    cargarMisViajes();
  }, []);

  const handleSolicitarViaje = async (e) => {
    e.preventDefault();

    if (!origen.trim() || !destino.trim() || !pasajeros || !servicio || !fechaHora) {
      alert('Error: Por favor, completa todos los campos obligatorios del formulario.');
      return;
    }

    const numPasajeros = parseInt(pasajeros, 10);
    if (isNaN(numPasajeros) || numPasajeros < 1 || numPasajeros > 50) {
      alert('Error: El número de pasajeros debe ser un valor entre 1 y 50.');
      return;
    }

    setEnviando(true);
    try {
      await crearViaje({
        origen: origen.trim(),
        destino: destino.trim(),
        cantidadPasajeros: numPasajeros,
        tipoServicio: servicio.toUpperCase(),
        fechaHora: fechaHora.length === 16 ? `${fechaHora}:00` : fechaHora,
      });

      alert('¡Viaje solicitado con éxito!');

      setOrigen('');
      setDestino('');
      setPasajeros('');
      setServicio('');
      setFechaHora('');
      cargarMisViajes();
    } catch (error) {
      console.error('Error al solicitar viaje:', error);
      alert('❌ No se pudo registrar el viaje. Verifica los datos o tu sesión.');
    } finally {
      setEnviando(false);
    }
  };

  const handleCalificar = async (viajeId, nota) => {
    try {
      await calificarViaje(viajeId, nota);
      alert(`¡Gracias! Calificaste el viaje con ${nota} estrellas.`);
      cargarMisViajes();
    } catch (error) {
      console.error('Error al calificar viaje:', error);
      alert('❌ No se pudo guardar la calificación.');
    }
  };

  const badgeEstado = (estado) => {
    switch (estado) {
      case 'FINALIZADO':
        return 'bg-success';
      case 'EN_CURSO':
      case 'EN_RUTA':
        return 'bg-primary';
      case 'CON_RETRASO':
        return 'bg-danger';
      default:
        return 'bg-warning text-dark';
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      {/* Banner Superior con degradado */}
      <div className="pp-hero mb-5">
        <div className="container">
          <h1 className="fw-bold mb-2">¿Dónde decidirás viajar el día de hoy?</h1>
          <p className="lead m-0 opacity-75">
            Solicita un viaje, revisa en qué etapa va y califica el servicio una vez finalizado
          </p>
        </div>
      </div>

      {/* Contenido principal: Imagen y Formulario */}
      <div className="container flex-grow-1 mb-5">
        <div className="row g-4 align-items-center">
          
          {/* Columna Izquierda: Imagen de referencia */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 overflow-hidden h-100">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" 
                alt="Paradero de bus" 
                className="card-img-top object-fit-cover"
                style={{ height: '380px' }}
              />
            </div>
          </div>

          {/* Columna Derecha: Tarjeta con Formulario */}
          <div className="col-lg-6">
            <div className="card p-4 shadow-sm pp-card-accent">
              <h3 className="mb-4 fw-bold">Solicitar un viaje</h3>
              
              <form onSubmit={handleSolicitarViaje}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="viaje-origen" className="form-label text-muted small fw-bold">Origen</label>
                    <input
                      id="viaje-origen" 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: Providencia"
                      value={origen}
                      onChange={(e) => setOrigen(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="viaje-destino" className="form-label text-muted small fw-bold">Destino</label>
                    <input
                      id="viaje-destino" 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej: Aeropuerto SCL"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="viaje-pasajeros" className="form-label text-muted small fw-bold">N° de pasajeros</label>
                    <input
                      id="viaje-pasajeros" 
                      type="number" 
                      className="form-control" 
                      placeholder="1 a 50"
                      min="1"
                      max="50"
                      value={pasajeros}
                      onChange={(e) => setPasajeros(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="viaje-servicio" className="form-label text-muted small fw-bold">Tipo de servicio</label>
                    <select
                      id="viaje-servicio" 
                      className="form-select"
                      value={servicio}
                      onChange={(e) => setServicio(e.target.value)}
                    >
                      <option value="">Selecciona un servicio</option>
                      <option value="estandar">Estándar</option>
                      <option value="ejecutivo">Ejecutivo</option>
                      <option value="grupal">Grupal</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="viaje-fecha" className="form-label text-muted small fw-bold">Fecha y hora del viaje</label>
                  <input
                    id="viaje-fecha" 
                    type="datetime-local" 
                    className="form-control"
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                  disabled={enviando}
                >
                  {enviando ? 'Solicitando...' : 'Solicitar viaje'}
                </button>
              </form>

            </div>
          </div>

        </div>

        {/* ==================== SECCIÓN MIS VIAJES Y CALIFICACIÓN ==================== */}
        <section className="mt-5">
          <div className="card p-4 shadow-sm border-0">
            <h3 className="h4 fw-bold mb-3">Mis viajes solicitados</h3>

            {cargandoViajes ? (
              <p className="text-muted mb-0">Cargando historial de viajes...</p>
            ) : misViajes.length === 0 ? (
              <p className="text-muted mb-0">Aún no has solicitado viajes.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ruta</th>
                      <th>Fecha y Hora</th>
                      <th>Servicio</th>
                      <th>Vehículo / Conductor</th>
                      <th>Estado</th>
                      <th className="text-end">Calificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misViajes.map((viaje) => (
                      <tr key={viaje.id}>
                        <td className="fw-semibold">{viaje.origen} → {viaje.destino}</td>
                        <td>{new Date(viaje.fechaHora).toLocaleString('es-CL')}</td>
                        <td>{viaje.tipoServicio} ({viaje.cantidadPasajeros} pax)</td>
                        <td>
                          {viaje.vehiculo
                            ? `${viaje.vehiculo.patente} · ${viaje.conductor?.nombreCompleto || 'Asignado'}`
                            : <span className="text-muted">Por asignar</span>}
                        </td>
                        <td>
                          <span className={`badge ${badgeEstado(viaje.estado)}`}>
                            {viaje.estado}
                          </span>
                        </td>
                        <td className="text-end">
                          {viaje.calificacion ? (
                            <span className="fw-bold text-warning">
                              {'★'.repeat(viaje.calificacion)} ({viaje.calificacion}/5)
                            </span>
                          ) : viaje.estado === 'FINALIZADO' ? (
                            <div className="btn-group btn-group-sm" role="group">
                              {[1, 2, 3, 4, 5].map((estrella) => (
                                <button
                                  key={estrella}
                                  type="button"
                                  className="btn btn-outline-warning text-dark"
                                  onClick={() => handleCalificar(viaje.id, estrella)}
                                >
                                  {estrella}★
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted small">Disponible al finalizar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}