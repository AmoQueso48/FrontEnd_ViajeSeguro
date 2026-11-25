const API_URL = "http://localhost:8080/api";

// Helper para incluir el token JWT en las peticiones protegidas
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ================= AUTENTICACIÓN =================
export const loginUsuario = async (email, password, rol) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rol }),
  });
  if (!res.ok) throw new Error("Credenciales o rol incorrectos");
  const data = await res.json();

  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data));
  return data;
};

export const registrarUsuario = async (usuario) => {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error("Error al registrar usuario");
  return res.json();
};

export const cerrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

// ================= VEHÍCULOS Y MÉTRICAS (ADMIN) =================
export const obtenerVehiculos = async () => {
  const res = await fetch(`${API_URL}/vehiculos`, { headers: getAuthHeaders() });
  return res.json();
};

export const obtenerVehiculosDisponibles = async () => {
  const res = await fetch(`${API_URL}/vehiculos/disponibles`, { headers: getAuthHeaders() });
  return res.json();
};

export const obtenerMetricasAdmin = async () => {
  const res = await fetch(`${API_URL}/vehiculos/metricas`, { headers: getAuthHeaders() });
  return res.json();
};

export const crearVehiculo = async (vehiculo) => {
  const res = await fetch(`${API_URL}/vehiculos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(vehiculo),
  });
  if (!res.ok) throw new Error("Error al crear vehículo");
  return res.json();
};

export const actualizarVehiculo = async (id, vehiculo) => {
  const res = await fetch(`${API_URL}/vehiculos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(vehiculo),
  });
  if (!res.ok) throw new Error("Error al actualizar vehículo");
  return res.json();
};

export const eliminarVehiculo = async (id) => {
  const res = await fetch(`${API_URL}/vehiculos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar vehículo");
};

// ================= VIAJES (CLIENTE / CONDUCTOR / ADMIN) =================
export const obtenerViajes = async () => {
  const res = await fetch(`${API_URL}/viajes`, { headers: getAuthHeaders() });
  return res.json();
};

export const obtenerViajesPendientes = async () => {
  const res = await fetch(`${API_URL}/viajes/pendientes`, { headers: getAuthHeaders() });
  return res.json();
};

export const obtenerMisViajes = async () => {
  const res = await fetch(`${API_URL}/viajes/mis-viajes`, { headers: getAuthHeaders() });
  return res.json();
};

export const crearViaje = async (viaje) => {
  const res = await fetch(`${API_URL}/viajes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(viaje),
  });
  if (!res.ok) throw new Error("Error al crear el viaje");
  return res.json();
};

export const asignarViaje = async (id, asignacion) => {
  const res = await fetch(`${API_URL}/viajes/${id}/asignar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(asignacion),
  });
  if (!res.ok) throw new Error("Error al asignar vehículo y conductor");
  return res.json();
};

export const actualizarEstadoViaje = async (id, estado) => {
  const res = await fetch(`${API_URL}/viajes/${id}/estado`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado del viaje");
  return res.json();
};

export const calificarViaje = async (id, calificacion) => {
  const res = await fetch(`${API_URL}/viajes/${id}/calificar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ calificacion }),
  });
  if (!res.ok) throw new Error("Error al calificar el viaje");
  return res.json();
};

export const eliminarViaje = async (id) => {
  const res = await fetch(`${API_URL}/viajes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar el viaje");
};

// ================= NOVEDADES (CONDUCTOR / ADMIN) =================
export const obtenerNovedades = async () => {
  const res = await fetch(`${API_URL}/novedades`, { headers: getAuthHeaders() });
  return res.json();
};

export const reportarNovedad = async (novedad) => {
  const res = await fetch(`${API_URL}/novedades`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(novedad),
  });
  if (!res.ok) throw new Error("Error al reportar novedad");
  return res.json();
};