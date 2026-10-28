import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePolling } from '../hooks/usePolling';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('usePolling', () => {
  it('ejecuta al montar y luego en cada intervalo', () => {
    const tarea = vi.fn();
    renderHook(() => usePolling(tarea, 5000));
    expect(tarea).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(15000);
    expect(tarea).toHaveBeenCalledTimes(4);
  });

  it('no consulta si no está activo y se detiene al desmontar', () => {
    const tarea = vi.fn();
    const { unmount } = renderHook(() => usePolling(tarea, 1000, false));
    vi.advanceTimersByTime(5000);
    expect(tarea).not.toHaveBeenCalled();

    const activa = vi.fn();
    const { unmount: desmontar } = renderHook(() => usePolling(activa, 1000, true));
    desmontar();
    vi.advanceTimersByTime(5000);
    expect(activa).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('vuelve a ejecutar de inmediato cuando cambia la clave', () => {
    const tarea = vi.fn();
    const { rerender } = renderHook(({ clave }) => usePolling(tarea, 10000, true, clave), {
      initialProps: { clave: 'a' },
    });
    expect(tarea).toHaveBeenCalledTimes(1);
    rerender({ clave: 'b' });
    expect(tarea).toHaveBeenCalledTimes(2);
    rerender({ clave: 'b' });
    expect(tarea).toHaveBeenCalledTimes(2);
  });

  it('no consulta con la pestaña oculta', () => {
    const tarea = vi.fn();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    renderHook(() => usePolling(tarea, 1000));
    vi.advanceTimersByTime(5000);
    expect(tarea).not.toHaveBeenCalled();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });
});
