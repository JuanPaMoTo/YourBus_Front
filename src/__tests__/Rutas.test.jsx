import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Rutas from "../pages/Rutas";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({
  api: { getRutas: vi.fn(), getIncidentesActivos: vi.fn() },
}));

const CARGANDO = "Cargando rutas...";
const VACIO = "Aún no hay rutas cargadas. Conecta el backend para verlas aquí.";
const ERROR = "No fue posible cargar las rutas.";

// Pruebas de caja blanca: cada prueba recorre una rama de Rutas.jsx
// (cargando, con datos, sin datos y con error).
describe("Rutas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getIncidentesActivos.mockResolvedValue([]);
  });

  it('muestra "Cargando" mientras la API no responde', () => {
    api.getRutas.mockReturnValue(new Promise(() => {}));
    api.getIncidentesActivos.mockReturnValue(new Promise(() => {}));
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

  it("muestra el aviso de un incidente activo bajo su ruta", async () => {
    api.getRutas.mockResolvedValue([
      { id: "1", codigo: "L1", nombre: "Terminal Norte - Centro" },
      { id: "2", codigo: "L4", nombre: "Centro - Sur" },
    ]);
    api.getIncidentesActivos.mockResolvedValue([
      {
        id: "i1",
        tipo: "bloqueo",
        descripcion: "Calle cerrada por obras",
        estado: "activo",
        creadoEn: new Date().toISOString(),
        ruta: { id: "1", codigo: "L1", nombre: "Terminal Norte - Centro" },
      },
    ]);
    render(<Rutas />);

    const aviso = await screen.findByText("Calle cerrada por obras");
    expect(aviso.closest(".route-item").textContent).toContain("L1");
    expect(screen.getAllByText("Calle cerrada por obras")).toHaveLength(1);
  });

  it("si fallan los avisos, igual muestra las rutas", async () => {
    api.getRutas.mockResolvedValue([{ id: "1", codigo: "L1", nombre: "Norte" }]);
    api.getIncidentesActivos.mockRejectedValue(new Error("500"));
    render(<Rutas />);

    expect(await screen.findByText("L1")).toBeTruthy();
    expect(screen.queryByText(ERROR)).toBeNull();
  });
});
