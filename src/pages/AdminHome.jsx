import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  obtenerMetricasAdmin,
  obtenerViajesPendientes,
  obtenerVehiculosDisponibles,
  obtenerVehiculos,
  crearVehiculo,
  eliminarVehiculo,
  asignarViaje,
  obtenerNovedades,
} from '../services/api';

const METRICAS_INICIALES = {
  utilizacionFlota: 72,
  viajesConRetraso: 18,
  aumentoCombustible: 15,
  vehiculosFueraServicio: 22,
};

const VIAJES_RESPALDO = [
  { id: '1', origen: 'Providencia', destino: 'Aeropuerto SCL', hora: '10:00 AM' },
  { id: '2', origen: 'Santiago Centro', destino: 'Viña del Mar', hora: '14:30 PM' },
  { id: '3', origen: 'Las Condes', destino: 'Rancagua', hora: '18:00 PM' },
];

const VEHICULOS_RESPALDO = [
  { id: 'bus-01', label: 'Bus MAN VIP #A41' },
  { id: 'bus-02', label: 'Mercedes-Benz Sprinter #B12' },
  { id: 'bus-03', label: 'Volvo B11R #C05' },
];

const CONDUCTORES_DISPONIBLES = [
  { id: '2', legacyId: 'c1', nombre: 'Juan Pérez (Conductor Sistema)' },
  { id: 'c2', nombre: 'Carlos Gómez' },
  { id: 'c3', nombre: 'María González' },
];

export default function AdminHome() {
  const [viaje, setViaje] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [conductor, setConductor] = useState('');

  const [metricas, setMetricas] = useState(METRICAS_INICIALES);
  const [viajesPendientes, setViajesPendientes] = useState(VIAJES_RESPALDO);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState(VEHICULOS_RESPALDO);
  const [flotaCompleta, setFlotaCompleta] = useState([]);
  const [novedades, setNovedades] = useState([]);
  const [usandoBackend, setUsandoBackend] = useState(false);

  // Estados para crear un nuevo vehículo en la flota
  const [patente, setPatente] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidad, setCapacidad] = useState('');

  const cargarDatosPanel = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [dataMetricas, dataPendientes, dataDisponibles, dataFlota, dataNovedades] =
        await Promise.all([
          obtenerMetricasAdmin(),
          obtenerViajesPendientes(),
          obtenerVehiculosDisponibles(),
          obtenerVehiculos(),
          obtenerNovedades(),
        ]);

      setUsandoBackend(true);

      if (dataMetricas && typeof dataMetricas.utilizacionFlota === 'number') {
        setMetricas(dataMetricas);
      }
      if (Array.isArray(dataPendientes)) {
        setViajesPendientes(dataPendientes);
      }
      if (Array.isArray(dataDisponibles)) {
        setVehiculosDisponibles(
          dataDisponibles.map((v) => ({
            id: String(v.id),
            label: `${v.patente} · ${v.modelo} (${v.capacidad} pax)`,
          }))
        );
      }
      if (Array.isArray(dataFlota)) {
        setFlotaCompleta(dataFlota);
      }
      if (Array.isArray(dataNovedades)) {
        setNovedades(dataNovedades);
      }
    } catch (error) {
      console.error('Error al cargar datos del panel admin:', error);
    }
  };

  useEffect(() => {
    cargarDatosPanel();
  }, []);

  const handleAsignar = async (e) => {
    e.preventDefault();

    if (!viaje || !vehiculo || !conductor) {
      alert('Error: Debes seleccionar un viaje, un vehículo y un conductor.');
      return;
    }

    if (usandoBackend && !isNaN(Number(viaje)) && !isNaN(Number(vehiculo))) {
      try {
        const conductorIdNum = isNaN(Number(conductor)) ? 2 : Number(conductor);
        await asignarViaje(Number(viaje), {
          vehiculoId: Number(vehiculo),
          conductorId: conductorIdNum,
        });
        await cargarDatosPanel();
      } catch (error) {
        console.error('Error al asignar en backend:', error);
        alert('❌ Error al asignar vehículo y conductor en el servidor.');
        return;
      }
    }

    alert('Vehículo y conductor asignados correctamente al viaje!');

    setViaje('');
    setVehiculo('');
    setConductor('');
  };

  const handleCrearVehiculo = async (e) => {
    e.preventDefault();
    if (!patente.trim() || !modelo.trim() || !capacidad) return;

    try {
      await crearVehiculo({
        patente: patente.trim().toUpperCase(),
        modelo: modelo.trim(),
        capacidad: parseInt(capacidad, 10),
        estado: 'DISPONIBLE',
      });
      setPatente('');
      setModelo('');
      setCapacidad('');
      alert('Vehículo agregado a la flota correctamente.');
      cargarDatosPanel();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      alert('❌ No se pudo registrar el vehículo (verifica que la patente no exista).');
    }
  };

  const handleEliminarVehiculo = async (id) => {
    try {
      await eliminarVehiculo(id);
      cargarDatosPanel();
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      alert('❌ No se puede eliminar el vehículo porque tiene viajes asociados.');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Encabezado */}
      <Header />

      {/* Banner Principal: Panel de Administración */}
      <div className="pp-hero mb-4">
        <div className="container">
          <h1 className="fw-bold mb-2">Panel de administración</h1>
          <p className="lead m-0 opacity-75">
            Visión general de la operación: uso de la flota, estado de los vehículos y asignación de recursos
          </p>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        {/* ================= TARJETAS DE ESTADÍSTICAS ================= */}
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h2 className="display-5 fw-bold pp-stat mb-1">{metricas.utilizacionFlota}%</h2>
              <span className="text-muted small">Utilización actual de la flota</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h2 className="display-5 fw-bold pp-stat mb-1">{metricas.viajesConRetraso}%</h2>
              <span className="text-muted small">Viajes con retraso</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h2 className="display-5 fw-bold pp-stat mb-1">+{metricas.aumentoCombustible}%</h2>
              <span className="text-muted small">Aumento en costo de combustible</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3">
              <h2 className="display-5 fw-bold pp-stat mb-1">{metricas.vehiculosFueraServicio}%</h2>
              <span className="text-muted small">Vehículos fuera de servicio</span>
            </div>
          </div>
        </div>

        {/* ================= FORMULARIO E IMAGEN ================= */}
        <div className="row g-4 align-items-center mb-5">
          {/* Columna Izquierda: Formulario de Asignación */}
          <div className="col-lg-6">
            <div className="card p-4 shadow-sm pp-card-accent">
              <h3 className="mb-4 fw-bold">Asignar vehículo y conductor</h3>

              <form onSubmit={handleAsignar}>
                <div className="mb-3">
                  <label htmlFor="asignar-viaje" className="form-label text-muted small fw-bold">
                    Viaje pendiente
                  </label>
                  <select
                    id="asignar-viaje"
                    className="form-select"
                    value={viaje}
                    onChange={(e) => setViaje(e.target.value)}
                  >
                    <option value="">Selecciona un viaje solicitado</option>
                    {viajesPendientes.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.origen} ➔ {v.destino}{' '}
                        {v.hora
                          ? `(${v.hora})`
                          : v.fechaHora
                          ? `(${new Date(v.fechaHora).toLocaleString('es-CL')})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="asignar-vehiculo" className="form-label text-muted small fw-bold">
                      Vehículo disponible
                    </label>
                    <select
                      id="asignar-vehiculo"
                      className="form-select"
                      value={vehiculo}
                      onChange={(e) => setVehiculo(e.target.value)}
                    >
                      <option value="">Selecciona un vehículo</option>
                      {vehiculosDisponibles.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="asignar-conductor" className="form-label text-muted small fw-bold">
                      Conductor
                    </label>
                    <select
                      id="asignar-conductor"
                      className="form-select"
                      value={conductor}
                      onChange={(e) => setConductor(e.target.value)}
                    >
                      <option value="">Selecciona un conductor</option>
                      {CONDUCTORES_DISPONIBLES.map((c) => (
                        <option key={c.id} value={usandoBackend ? c.id : c.legacyId || c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary px-4 mt-2 shadow-sm">
                  Asignar
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Imagen del Bus */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"
                alt="Bus de transporte"
                className="card-img-top object-fit-cover"
                style={{ height: '360px' }}
              />
            </div>
          </div>
        </div>

        {/* ================= GESTIÓN DE FLOTA Y NOVEDADES (CONECTADO AL BACKEND) ================= */}
        {usandoBackend && (
          <div className="row g-4">
            {/* CRUD Flota de Vehículos */}
            <div className="col-lg-7">
              <div className="card p-4 shadow-sm border-0 h-100">
                <h4 className="fw-bold mb-3">Gestión de Flota</h4>

                <form onSubmit={handleCrearVehiculo} className="row g-2 mb-3">
                  <div className="col-sm-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Patente (CD5678)"
                      value={patente}
                      onChange={(e) => setPatente(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Modelo (Ej: Volvo B11R)"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-3">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Capacidad"
                      min="1"
                      max="60"
                      value={capacidad}
                      onChange={(e) => setCapacidad(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-sm-2">
                    <button type="submit" className="btn btn-dark btn-sm w-100">
                      Agregar
                    </button>
                  </div>
                </form>

                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Patente</th>
                        <th>Modelo</th>
                        <th>Cap.</th>
                        <th>Estado</th>
                        <th className="text-end">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flotaCompleta.map((v) => (
                        <tr key={v.id}>
                          <td className="fw-bold">{v.patente}</td>
                          <td>{v.modelo}</td>
                          <td>{v.capacidad}</td>
                          <td>
                            <span
                              className={`badge ${
                                v.estado === 'DISPONIBLE'
                                  ? 'bg-success'
                                  : v.estado === 'EN_RUTA'
                                  ? 'bg-primary'
                                  : 'bg-secondary'
                              }`}
                            >
                              {v.estado}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleEliminarVehiculo(v.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Novedades reportadas por conductores */}
            <div className="col-lg-5">
              <div className="card p-4 shadow-sm border-0 h-100">
                <h4 className="fw-bold mb-3">Novedades Reportadas</h4>
                {novedades.length === 0 ? (
                  <p className="text-muted small mb-0">No hay incidencias reportadas por conductores.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {novedades.map((n) => (
                      <li key={n.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between">
                          <span className="badge bg-danger">{n.tipoNovedad}</span>
                          <small className="text-muted">
                            {new Date(n.fechaReporte).toLocaleString('es-CL')}
                          </small>
                        </div>
                        <p className="mb-1 mt-1 small">{n.descripcion}</p>
                        {n.viaje && (
                          <small className="text-muted">
                            Ruta: {n.viaje.origen} → {n.viaje.destino}
                          </small>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}