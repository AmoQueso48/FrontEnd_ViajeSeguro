import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ConductorHome from './ConductorHome';
import { renderConRouter } from '../test/utils';

const botonEnviar = () => screen.getByRole('button', { name: 'Enviar reporte' });

describe('Pruebas en la página ConductorHome', () => {
  let alertaMock;

  beforeEach(() => {
    alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertaMock.mockRestore();
  });

  test('Debe mostrar la orden de viaje asignada y la sección de reportar novedades', () => {
    renderConRouter(<ConductorHome />);

    expect(screen.getByText('Tu próximo viaje')).toBeInTheDocument();
    expect(screen.getByText('Orden de viaje asignada')).toBeInTheDocument();
    expect(screen.getByText('Reportar una novedad')).toBeInTheDocument();
  });

  test('lista en una tabla los seis datos de la orden de viaje', () => {
    renderConRouter(<ConductorHome />);

    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Colegio San Andrés')).toBeInTheDocument();
    expect(screen.getByText('Farellones')).toBeInTheDocument();
    expect(screen.getByText(/AB1234/)).toBeInTheDocument();
  });

  test('ofrece las cinco categorías de novedad en el selector', () => {
    renderConRouter(<ConductorHome />);

    const selector = screen.getByLabelText('Tipo de novedad');
    expect(within(selector).getAllByRole('option')).toHaveLength(6);
    ['Retraso', 'Falla mecánica', 'Accidente o incidente', 'Problema con pasajeros', 'Otro'].forEach((tipo) => {
      expect(within(selector).getByRole('option', { name: tipo })).toBeInTheDocument();
    });
  });

  test('el botón Enviar reporte usa la variante danger del componente Boton', () => {
    renderConRouter(<ConductorHome />);

    expect(botonEnviar()).toHaveClass('btn-danger');
    expect(botonEnviar()).toHaveAttribute('type', 'submit');
  });

  test('avisa cuando la descripción contiene solo espacios', async () => {
    const user = userEvent.setup();
    renderConRouter(<ConductorHome />);

    await user.selectOptions(screen.getByLabelText('Tipo de novedad'), 'Retraso');
    await user.type(screen.getByLabelText('Cuéntanos qué ocurrió'), '   ');
    await user.click(botonEnviar());

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('completa todos los campos'));
  });

  test('envía el reporte y limpia el formulario cuando los datos son válidos', async () => {
    const user = userEvent.setup();
    renderConRouter(<ConductorHome />);

    await user.selectOptions(screen.getByLabelText('Tipo de novedad'), 'Falla mecánica');
    await user.type(screen.getByLabelText('Cuéntanos qué ocurrió'), 'El bus presenta ruido en el motor');
    await user.click(botonEnviar());

    expect(alertaMock).toHaveBeenCalledWith('¡Reporte enviado con éxito!');
    expect(screen.getByLabelText('Cuéntanos qué ocurrió')).toHaveValue('');
    expect(screen.getByLabelText('Tipo de novedad')).toHaveValue('');
  });
});
