import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminHome from './AdminHome';
import { renderConRouter } from '../test/utils';

const botonAsignar = () => screen.getByRole('button', { name: 'Asignar' });

describe('Pruebas en la página AdminHome', () => {
  let alertaMock;

  beforeEach(() => {
    alertaMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertaMock.mockRestore();
  });

  test('Debe mostrar el panel de administración y las métricas de la flota', () => {
    renderConRouter(<AdminHome />);

    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
    expect(screen.getByText('Utilización actual de la flota')).toBeInTheDocument();
    expect(screen.getByText('Asignar vehículo y conductor')).toBeInTheDocument();
  });

  test('muestra las cuatro métricas de la operación', () => {
    renderConRouter(<AdminHome />);

    ['72%', '18%', '+15%', '22%'].forEach((valor) => {
      expect(screen.getByText(valor)).toBeInTheDocument();
    });
  });

  test('cada selector guarda en el estado la opción elegida', async () => {
    const user = userEvent.setup();
    renderConRouter(<AdminHome />);

    await user.selectOptions(screen.getByLabelText('Viaje pendiente'), '2');
    await user.selectOptions(screen.getByLabelText('Vehículo disponible'), 'bus-02');
    await user.selectOptions(screen.getByLabelText('Conductor'), 'c3');

    expect(screen.getByLabelText('Viaje pendiente')).toHaveValue('2');
    expect(screen.getByLabelText('Vehículo disponible')).toHaveValue('bus-02');
    expect(screen.getByLabelText('Conductor')).toHaveValue('c3');
  });

  test('avisa cuando no se ha seleccionado ninguna opción', async () => {
    const user = userEvent.setup();
    renderConRouter(<AdminHome />);

    await user.click(botonAsignar());

    expect(alertaMock).toHaveBeenCalledTimes(1);
    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('Debes seleccionar'));
  });

  test('sigue avisando y conserva la selección si falta vehículo o conductor', async () => {
    const user = userEvent.setup();
    renderConRouter(<AdminHome />);

    await user.selectOptions(screen.getByLabelText('Viaje pendiente'), '1');
    await user.click(botonAsignar());

    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('Debes seleccionar'));
    expect(screen.getByLabelText('Viaje pendiente')).toHaveValue('1');
  });

  test('asigna vehículo y conductor y reinicia los selectores', async () => {
    const user = userEvent.setup();
    renderConRouter(<AdminHome />);

    await user.selectOptions(screen.getByLabelText('Viaje pendiente'), '1');
    await user.selectOptions(screen.getByLabelText('Vehículo disponible'), 'bus-01');
    await user.selectOptions(screen.getByLabelText('Conductor'), 'c1');
    await user.click(botonAsignar());

    expect(alertaMock).toHaveBeenCalledWith(expect.stringContaining('asignados correctamente'));
    expect(screen.getByLabelText('Viaje pendiente')).toHaveValue('');
    expect(screen.getByLabelText('Vehículo disponible')).toHaveValue('');
    expect(screen.getByLabelText('Conductor')).toHaveValue('');
  });
});
