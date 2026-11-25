import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario, registrarUsuario } from '../services/api';

export default function Login() {
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [perfil, setPerfil] = useState('cliente');
  const [errorLogin, setErrorLogin] = useState('');
  const [cargando, setCargando] = useState(false);

  const [nombreRegistro, setNombreRegistro] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [passwordRegistro, setPasswordRegistro] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    setCargando(true);

    try {
      // El backend espera el rol en mayúsculas: "CLIENTE", "CONDUCTOR" o "ADMIN"
      await loginUsuario(emailLogin, passwordLogin, perfil.toUpperCase());

      if (perfil === 'cliente') {
        navigate('/cliente');
      } else if (perfil === 'conductor') {
        navigate('/conductor');
      } else if (perfil === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      setErrorLogin(error.message || 'Credenciales o perfil incorrectos');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();

    if (passwordRegistro !== confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    try {
      await registrarUsuario({
        nombreCompleto: nombreRegistro,
        email: emailRegistro,
        password: passwordRegistro,
        rol: 'CLIENTE', // Los nuevos registros entran como CLIENTE por defecto
      });

      alert('¡Usuario registrado con éxito! Ya puedes iniciar sesión.');
      setNombreRegistro('');
      setEmailRegistro('');
      setPasswordRegistro('');
      setConfirmPassword('');
    } catch (error) {
      alert(error.message || 'No se pudo registrar el usuario (el email puede estar en uso).');
    }
  };

  return (
    <div className="pp-login">
      <div className="container py-5">
        <div className="row g-4 justify-content-center">

          {/* ==================== COLUMNA IZQUIERDA: INICIO DE SESIÓN ==================== */}
          <div className="col-md-5">
            <div className="card p-4 shadow-sm h-100">
              <h3 className="text-center mb-4 fw-bold">Inicio de sesión</h3>

              {errorLogin && (
                <div className="alert alert-danger py-2" role="alert">
                  {errorLogin}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-control"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    placeholder="mosquito@gmail.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-control"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="login-perfil" className="form-label">Ingresar como</label>
                  <select
                    id="login-perfil"
                    className="form-select"
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value)}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="conductor">Conductor</option>
                    <option value="admin">Administrador / Supervisor</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-2"
                  disabled={cargando}
                >
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            </div>
          </div>

          {/* ==================== COLUMNA DERECHA: REGISTRO DE USUARIO ==================== */}
          <div className="col-md-5">
            <div className="card p-4 shadow-sm h-100">
              <h3 className="text-center mb-4 fw-bold">Registro de usuario</h3>
              <form onSubmit={handleRegistroSubmit}>
                <div className="mb-3">
                  <label htmlFor="registro-nombre" className="form-label">Nombre completo</label>
                  <input
                    id="registro-nombre"
                    type="text"
                    className="form-control"
                    value={nombreRegistro}
                    onChange={(e) => setNombreRegistro(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-email" className="form-label">Email</label>
                  <input
                    id="registro-email"
                    type="email"
                    className="form-control"
                    value={emailRegistro}
                    onChange={(e) => setEmailRegistro(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-password" className="form-label">Contraseña</label>
                  <input
                    id="registro-password"
                    type="password"
                    className="form-control"
                    value={passwordRegistro}
                    onChange={(e) => setPasswordRegistro(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-confirmar" className="form-label">Confirma tu contraseña</label>
                  <input
                    id="registro-confirmar"
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100 mt-2">
                  Registrarse
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}