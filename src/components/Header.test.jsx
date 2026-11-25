import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Header from './Header';
import { renderConRouter } from '../test/utils';

const navegarMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return { ...original, useNavigate: () => navegarMock };
});

describe('Componente Header', () => {
  beforeEach(() => {
    navegarMock.mockClear();
  });

  test('muestra la marca y los enlaces hacia cada perfil', () => {
    renderConRouter(<Header />);

    expect(screen.getByRole('link', { name: 'Viaje Seguro' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('href', '/cliente');
    expect(screen.getByRole('link', { name: 'Conductores' })).toHaveAttribute('href', '/conductor');
    expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin');
  });

  test('el botón Cerrar sesión redirige a la página de inicio', async () => {
    const user = userEvent.setup();
    renderConRouter(<Header />);

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(navegarMock).toHaveBeenCalledTimes(1);
    expect(navegarMock).toHaveBeenCalledWith('/');
  });

  test('el buscador conserva el texto escrito y no navega al enviar', async () => {
    const user = userEvent.setup();
    renderConRouter(<Header />);

    const campo = screen.getByRole('searchbox', { name: 'Buscar' });
    await user.type(campo, 'Farellones');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(campo).toHaveValue('Farellones');
    expect(navegarMock).not.toHaveBeenCalled();
  });
});
