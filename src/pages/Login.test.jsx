import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from './Login';
import { renderConRouter } from '../test/utils';

const navegarMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return { ...original, useNavigate: () => navegarMock };
});

const tarjeta = (titulo) => within(screen.getByText(titulo).closest('.card'));

describe('Pruebas en la página de Login', () => {
  let alertaMock;

  beforeEach(() => {
    navegarMock.mockClear();
    alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertaMock.mockRestore();
  });

  test('Debe renderizar los títulos de inicio de sesión y registro', () => {
    renderConRouter(<Login />);

    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
    expect(screen.getByText('Registro de usuario')).toBeInTheDocument();
  });

  test('Debe mostrar las opciones del selector de perfiles', () => {
    renderConRouter(<Login />);

    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Conductor')).toBeInTheDocument();
    expect(screen.getByText('Administrador / Supervisor')).toBeInTheDocument();
  });

  test('el campo de email del inicio de sesión refleja lo que escribe el usuario', async () => {
    const user = userEvent.setup();
    renderConRouter(<Login />);

    const email = tarjeta('Inicio de sesión').getByLabelText('Email');
    await user.type(email, 'supervisor@viajeseguro.cl');

    expect(email).toHaveValue('supervisor@viajeseguro.cl');
  });

  test.each([
    ['cliente', '/cliente'],
    ['conductor', '/conductor'],
    ['admin', '/admin'],
  ])('al ingresar con el perfil %s redirige a %s', async (perfil, ruta) => {
    const user = userEvent.setup();
    renderConRouter(<Login />);
    const inicio = tarjeta('Inicio de sesión');

    await user.type(inicio.getByLabelText('Email'), 'usuario@viajeseguro.cl');
    await user.type(inicio.getByLabelText('Contraseña'), 'Clave1234');
    await user.selectOptions(inicio.getByLabelText('Ingresar como'), perfil);
    await user.click(inicio.getByRole('button', { name: 'Ingresar' }));

    expect(navegarMock).toHaveBeenCalledTimes(1);
    expect(navegarMock).toHaveBeenCalledWith(ruta);
  });

  test('no redirige cuando los campos obligatorios están vacíos', async () => {
    const user = userEvent.setup();
    renderConRouter(<Login />);

    await user.click(tarjeta('Inicio de sesión').getByRole('button', { name: 'Ingresar' }));

    expect(navegarMock).not.toHaveBeenCalled();
  });

  test('avisa cuando las contraseñas del registro no coinciden', async () => {
    const user = userEvent.setup();
    renderConRouter(<Login />);
    const registro = tarjeta('Registro de usuario');

    await user.type(registro.getByLabelText('Nombre completo'), 'Usuario de Prueba');
    await user.type(registro.getByLabelText('Email'), 'prueba@viajeseguro.cl');
    await user.type(registro.getByLabelText('Contraseña'), 'Clave1234');
    await user.type(registro.getByLabelText('Confirma tu contraseña'), 'Clave9999');
    await user.click(registro.getByRole('button', { name: 'Registrarse' }));

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith('Las contraseñas no coinciden. Por favor verifica.');
  });

  test('registra al usuario y limpia el formulario cuando los datos son válidos', async () => {
    const user = userEvent.setup();
    renderConRouter(<Login />);
    const registro = tarjeta('Registro de usuario');

    await user.type(registro.getByLabelText('Nombre completo'), 'Usuario de Prueba');
    await user.type(registro.getByLabelText('Email'), 'prueba@viajeseguro.cl');
    await user.type(registro.getByLabelText('Contraseña'), 'Clave1234');
    await user.type(registro.getByLabelText('Confirma tu contraseña'), 'Clave1234');
    await user.click(registro.getByRole('button', { name: 'Registrarse' }));

    expect(alertaMock).toHaveBeenCalledWith('¡Usuario registrado con éxito!');
    expect(registro.getByLabelText('Nombre completo')).toHaveValue('');
    expect(registro.getByLabelText('Email')).toHaveValue('');
    expect(registro.getByLabelText('Contraseña')).toHaveValue('');
    expect(registro.getByLabelText('Confirma tu contraseña')).toHaveValue('');
  });
});
