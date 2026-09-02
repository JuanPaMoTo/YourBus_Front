import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from '../pages/Home';

describe('Home', () => {
  it('muestra el titular principal', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(
      screen.getByText(/Sabe exactamente cuándo llega tu bus/i)
    ).toBeInTheDocument();
  });
});
