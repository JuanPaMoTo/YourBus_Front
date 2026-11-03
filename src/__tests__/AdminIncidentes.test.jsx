import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminIncidentes from "../pages/AdminIncidentes";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { getIncidentes: vi.fn(), cambiarEstadoIncidente: vi.fn() },
}));

const incidente = (extra = {}) => ({
  id: "i1",
  tipo: "accidente",
  descripcion: "Choque en la Av. Norte",
  estado: "activo",
  creadoEn: new Date().toISOString(),
  ruta: { id: "r1", codigo: "L1", nombre: "Terminal Norte - Centro" },
  reportadoPor: { id: "u2", nombre: "Carlos Conductor" },
  ...extra,
});

describe("AdminIncidentes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getIncidentes.mockResolvedValue([]);
  });

  it("pide los incidentes activos por defecto y avisa si no hay", async () => {
    render(<AdminIncidentes />);

    expect(await screen.findByText("No hay incidentes para mostrar.")).toBeTruthy();
    expect(api.getIncidentes).toHaveBeenCalledWith("activo");
  });

  it("muestra cada incidente diferenciado, con quién lo reportó", async () => {
    api.getIncidentes.mockResolvedValue([
      incidente(),
      incidente({ id: "i2", tipo: "clima", descripcion: "Lluvia fuerte", reportadoPor: { id: "u9", nombre: "Ana" } }),
    ]);
    render(<AdminIncidentes />);

    expect(await screen.findByText("Choque en la Av. Norte")).toBeTruthy();
    expect(screen.getByText("Lluvia fuerte")).toBeTruthy();
    expect(screen.getByText("Accidente")).toBeTruthy();
    expect(screen.getByText("Clima")).toBeTruthy();
    expect(screen.getByText(/Reportado por Carlos Conductor/)).toBeTruthy();
  });

  it("cambia el filtro y vuelve a consultar", async () => {
    render(<AdminIncidentes />);
    await screen.findByText("No hay incidentes para mostrar.");

    fireEvent.change(screen.getByLabelText("Mostrar"), { target: { value: "finalizado" } });
    await screen.findByText("No hay incidentes para mostrar.");
    expect(api.getIncidentes).toHaveBeenLastCalledWith("finalizado");

    fireEvent.change(screen.getByLabelText("Mostrar"), { target: { value: "" } });
    await screen.findByText("No hay incidentes para mostrar.");
    expect(api.getIncidentes).toHaveBeenLastCalledWith("");
  });

  it("marca un incidente como finalizado y recarga la lista", async () => {
    api.getIncidentes.mockResolvedValueOnce([incidente()]).mockResolvedValue([]);
    api.cambiarEstadoIncidente.mockResolvedValue({});
    render(<AdminIncidentes />);

    fireEvent.click(await screen.findByRole("button", { name: "Marcar como finalizado" }));

    expect(api.cambiarEstadoIncidente).toHaveBeenCalledWith("i1", "finalizado");
    expect(await screen.findByText("No hay incidentes para mostrar.")).toBeTruthy();
  });

  it("permite reactivar un incidente finalizado", async () => {
    api.getIncidentes.mockResolvedValue([incidente({ estado: "finalizado" })]);
    api.cambiarEstadoIncidente.mockResolvedValue({});
    render(<AdminIncidentes />);

    fireEvent.click(await screen.findByRole("button", { name: "Reactivar" }));
    expect(api.cambiarEstadoIncidente).toHaveBeenCalledWith("i1", "activo");
  });

  it("muestra el error si no se puede cargar o actualizar", async () => {
    api.getIncidentes.mockRejectedValue(new Error("No tienes permiso para esta acción"));
    render(<AdminIncidentes />);

    expect((await screen.findByRole("alert")).textContent).toContain("No tienes permiso");
  });

  it("muestra el error si falla el cambio de estado", async () => {
    api.getIncidentes.mockResolvedValue([incidente()]);
    api.cambiarEstadoIncidente.mockRejectedValue(new Error("Incidente no encontrado"));
    render(<AdminIncidentes />);

    fireEvent.click(await screen.findByRole("button", { name: "Marcar como finalizado" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Incidente no encontrado");
  });
});
