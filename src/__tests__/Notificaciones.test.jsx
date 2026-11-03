import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Notificaciones from "../pages/Notificaciones";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({ api: { getIncidentesActivos: vi.fn() } }));

const incidente = (extra = {}) => ({
  id: "i1",
  tipo: "bloqueo",
  descripcion: "Calle cerrada por obras",
  estado: "activo",
  creadoEn: new Date().toISOString(),
  ruta: { id: "r1", codigo: "L1", nombre: "Terminal Norte - Centro" },
  ...extra,
});

describe("Notificaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el título y 'Cargando' mientras la API no responde", () => {
    api.getIncidentesActivos.mockReturnValue(new Promise(() => {}));
    render(<Notificaciones />);

    expect(
      screen.getByRole("heading", { name: "Alertas del servicio" }),
    ).toBeTruthy();
    expect(screen.getByText("Cargando alertas...")).toBeTruthy();
  });

  it("avisa cuando no hay alertas activas", async () => {
    api.getIncidentesActivos.mockResolvedValue([]);
    render(<Notificaciones />);

    expect(
      await screen.findByText(/No hay alertas activas en este momento/),
    ).toBeTruthy();
  });

  it("lista los incidentes activos con su ruta, tipo y descripción", async () => {
    api.getIncidentesActivos.mockResolvedValue([
      incidente(),
      incidente({ id: "i2", tipo: "retraso", descripcion: "Retraso de 15 min" }),
    ]);
    render(<Notificaciones />);

    expect(await screen.findByText("Calle cerrada por obras")).toBeTruthy();
    expect(screen.getByText("Retraso de 15 min")).toBeTruthy();
    expect(screen.getByText("Bloqueo")).toBeTruthy();
    expect(screen.getByText("Retraso")).toBeTruthy();
    expect(screen.getAllByText("L1 · Terminal Norte - Centro")).toHaveLength(2);
  });

  it("muestra un error cuando la API falla", async () => {
    api.getIncidentesActivos.mockRejectedValue(new Error("500"));
    render(<Notificaciones />);

    expect(await screen.findByText("No fue posible cargar las alertas.")).toBeTruthy();
    expect(screen.queryByText("Cargando alertas...")).toBeNull();
  });
});
