import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import Boton from './Boton';

describe('Componente Boton', () => {
  test('muestra el texto recibido por props', () => {
    render(<Boton texto="Guardar cambios" />);

    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  test('usa la variante primary y el tipo button por defecto', () => {
    render(<Boton texto="Aceptar" />);

    const boton = screen.getByRole('button', { name: 'Aceptar' });
    expect(boton).toHaveClass('btn', 'btn-primary');
    expect(boton).toHaveAttribute('type', 'button');
  });

  test('aplica la variante, el tipo y la clase adicional indicados', () => {
    render(<Boton texto="Eliminar" variant="danger" type="submit" className="w-100" />);

    const boton = screen.getByRole('button', { name: 'Eliminar' });
    expect(boton).toHaveClass('btn-danger', 'w-100');
    expect(boton).toHaveAttribute('type', 'submit');
  });

  test('ejecuta la función onClick una vez por cada clic', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Boton texto="Enviar" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
