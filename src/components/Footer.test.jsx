import { screen } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import Footer from './Footer';
import { renderConRouter } from '../test/utils';

describe('Componente Footer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('muestra los datos de contacto de la empresa', () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole('link', { name: 'contacto@viajeseguro.cl' }))
      .toHaveAttribute('href', 'mailto:contacto@viajeseguro.cl');
    expect(screen.getByRole('link', { name: '+56 9 1213 2211' }))
      .toHaveAttribute('href', 'tel:+56912132211');
  });

  test('enlaza con los tres portales del sistema', () => {
    renderConRouter(<Footer />);

    expect(screen.getByRole('link', { name: 'Portal cliente' })).toHaveAttribute('href', '/cliente');
    expect(screen.getByRole('link', { name: 'Portal conductor' })).toHaveAttribute('href', '/conductor');
    expect(screen.getByRole('link', { name: 'Panel administración' })).toHaveAttribute('href', '/admin');
  });

  test('muestra el año actual usando una fecha simulada', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2031, 5, 15));

    renderConRouter(<Footer />);

    expect(screen.getByText(/© 2031/)).toBeInTheDocument();
  });
});
