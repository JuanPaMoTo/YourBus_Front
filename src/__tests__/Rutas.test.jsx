import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Rutas from "../pages/Rutas";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({ api: { getRutas: vi.fn() } }));

const CARGANDO = "Cargando rutas...";
const VACIO = "Aún no hay rutas cargadas. Conecta el backend para verlas aquí.";
const ERROR = "No fue posible cargar las rutas.";

// Pruebas de caja blanca: cada prueba recorre una rama de Rutas.jsx
// (cargando, con datos, sin datos y con error).
describe("Rutas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra "Cargando" mientras la API no responde', () => {
    api.getRutas.mockReturnValue(new Promise(() => {}));
    render(<Rutas />);

    expect(screen.getByText(CARGANDO)).toBeTruthy();
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("muestra las rutas con su código y nombre al terminar de cargar", async () => {
    api.getRutas.mockResolvedValue([
      { id: 1, codigo: "L1", nombre: "Terminal Norte - Centro" },
      { id: 2, codigo: "L4", nombre: "Centro - Sur" },
    ]);
    render(<Rutas />);

    expect(await screen.findByText("L1")).toBeTruthy();
    expect(screen.getByText("Terminal Norte - Centro")).toBeTruthy();
    expect(screen.getByText("L4")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(CARGANDO)).toBeNull());
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("avisa cuando todavía no hay rutas cargadas", async () => {
    api.getRutas.mockResolvedValue([]);
    render(<Rutas />);

    expect(await screen.findByText(VACIO)).toBeTruthy();
    expect(screen.queryByText(CARGANDO)).toBeNull();
  });

  it("muestra un error cuando la API falla, sin el aviso de lista vacía", async () => {
    api.getRutas.mockRejectedValue(new Error("Error en la petición: 500"));
    render(<Rutas />);

    expect(await screen.findByText(ERROR)).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(CARGANDO)).toBeNull());
    expect(screen.queryByText(VACIO)).toBeNull();
  });
});
