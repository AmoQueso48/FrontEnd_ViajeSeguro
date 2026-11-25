import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ClienteHome from './ClienteHome';
import { renderConRouter } from '../test/utils';

const botonSolicitar = () => screen.getByRole('button', { name: 'Solicitar viaje' });

const completarFormulario = async (user, pasajeros = '3') => {
  await user.type(screen.getByLabelText('Origen'), 'Providencia');
  await user.type(screen.getByLabelText('Destino'), 'Aeropuerto SCL');
  fireEvent.change(screen.getByLabelText(/pasajeros/i), { target: { value: pasajeros } });
  await user.selectOptions(screen.getByLabelText('Tipo de servicio'), 'ejecutivo');
  fireEvent.change(screen.getByLabelText(/Fecha y hora/), { target: { value: '2030-01-15T10:30' } });
};

describe('Pruebas en la página ClienteHome', () => {
  let alertaMock;

  beforeEach(() => {
    alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertaMock.mockRestore();
  });

  test('Debe mostrar el banner principal y el formulario de solicitud', () => {
    renderConRouter(<ClienteHome />);

    expect(screen.getByText('¿Dónde decidirás viajar el día de hoy?')).toBeInTheDocument();
    expect(screen.getByText('Solicitar un viaje')).toBeInTheDocument();
  });

  test('los campos de texto reflejan lo que escribe el usuario', async () => {
    const user = userEvent.setup();
    renderConRouter(<ClienteHome />);

    await user.type(screen.getByLabelText('Origen'), 'Las Condes');
    await user.type(screen.getByLabelText('Destino'), 'Farellones');

    expect(screen.getByLabelText('Origen')).toHaveValue('Las Condes');
    expect(screen.getByLabelText('Destino')).toHaveValue('Farellones');
  });

  test('avisa cuando se envía el formulario con campos vacíos', async () => {
    const user = userEvent.setup();
    renderConRouter(<ClienteHome />);

    await user.click(botonSolicitar());

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('completa todos los campos'));
  });

  test('trata un origen con solo espacios como un campo vacío', async () => {
    const user = userEvent.setup();
    renderConRouter(<ClienteHome />);

    await completarFormulario(user);
    await user.clear(screen.getByLabelText('Origen'));
    await user.type(screen.getByLabelText('Origen'), '   ');
    await user.click(botonSolicitar());

    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('completa todos los campos'));
  });

  test('rechaza una cantidad de pasajeros mayor a 50', async () => {
    const user = userEvent.setup();
    renderConRouter(<ClienteHome />);

    await completarFormulario(user, '60');
    fireEvent.submit(botonSolicitar().closest('form'));

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('entre 1 y 50'));
  });

  test('solicita el viaje y limpia el formulario cuando los datos son correctos', async () => {
    const user = userEvent.setup();
    renderConRouter(<ClienteHome />);

    await completarFormulario(user);
    await user.click(botonSolicitar());

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('Viaje solicitado con éxito'));
    expect(screen.getByLabelText('Origen')).toHaveValue('');
    expect(screen.getByLabelText('Destino')).toHaveValue('');
    expect(screen.getByLabelText('Tipo de servicio')).toHaveValue('');
  });
});
