import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from '../components/Navbar';

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Navbar', () => {
  it('muestra el nombre de la marca', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('YourBus')).toBeInTheDocument();
  });

  it('incluye los enlaces principales de navegación', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('Rutas')).toBeInTheDocument();
    expect(screen.getByText('Horarios')).toBeInTheDocument();
    expect(screen.getByText('Mapa y ETA')).toBeInTheDocument();
  });
});
