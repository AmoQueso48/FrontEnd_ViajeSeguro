import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderConRouter(ui, rutaInicial = '/') {
  return render(<MemoryRouter initialEntries={[rutaInicial]}>{ui}</MemoryRouter>);
}
