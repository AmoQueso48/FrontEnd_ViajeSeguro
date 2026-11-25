import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach } from 'vitest';
import App from './App';

const irA = (ruta) => window.history.pushState({}, '', ruta);

describe('Enrutamiento de la aplicación', () => {
  beforeEach(() => {
    irA('/');
  });

  test('la ruta raíz muestra la pantalla de inicio de sesión', () => {
    render(<App />);

    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
  });

  test.each([
    ['/cliente', '¿Dónde decidirás viajar el día de hoy?'],
    ['/conductor', 'Tu próximo viaje'],
    ['/admin', 'Panel de administración'],
  ])('la ruta %s muestra su portal', (ruta, titulo) => {
    irA(ruta);

    render(<App />);

    expect(screen.getByText(titulo)).toBeInTheDocument();
  });

  test('ingresar como administrador lleva al panel sin usar mocks', async () => {
    const user = userEvent.setup();
    render(<App />);
    const inicio = within(screen.getByText('Inicio de sesión').closest('.card'));

    await user.type(inicio.getByLabelText('Email'), 'admin@viajeseguro.cl');
    await user.type(inicio.getByLabelText('Contraseña'), 'Clave1234');
    await user.selectOptions(inicio.getByLabelText('Ingresar como'), 'admin');
    await user.click(inicio.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Panel de administración')).toBeInTheDocument();
  });
});
