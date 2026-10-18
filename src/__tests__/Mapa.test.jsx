import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Mapa from "../pages/Mapa";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({
  api: { getUbicacionBus: vi.fn(), getEta: vi.fn() },
}));

const ERROR_UBICACION = "La ubicación del bus no está disponible.";
const ERROR_ETA = "El tiempo estimado de llegada no está disponible.";

function consultarUbicacion(busId) {
  fireEvent.change(screen.getByLabelText("ID del bus"), {
    target: { value: busId },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ver ubicación" }));
}

function consultarEta(paraderoId) {
  fireEvent.change(screen.getByLabelText("ID del paradero"), {
    target: { value: paraderoId },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ver ETA" }));
}

// Pruebas de caja blanca: cada prueba recorre una rama de Mapa.jsx
// (estado inicial, consulta correcta, consulta con error y limpieza del error).
describe("Mapa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("al inicio no muestra ubicación, ETA ni errores", () => {
    render(<Mapa />);

    expect(screen.queryByText("En ruta")).toBeNull();
    expect(screen.queryByText(/ min$/)).toBeNull();
    expect(screen.queryByText(ERROR_UBICACION)).toBeNull();
  });

  it("muestra la ubicación del bus consultado", async () => {
    api.getUbicacionBus.mockResolvedValue({ lat: -33.437, lng: -70.6505 });
    render(<Mapa />);

    consultarUbicacion("BUS-102");

    expect(await screen.findByText("En ruta")).toBeTruthy();
    expect(screen.getByText(/Lat -33\.437/)).toBeTruthy();
    expect(api.getUbicacionBus).toHaveBeenCalledWith("BUS-102");
  });

  it("muestra un error cuando la ubicación no está disponible", async () => {
    api.getUbicacionBus.mockRejectedValue(
      new Error("Error en la petición: 404"),
    );
    render(<Mapa />);

    consultarUbicacion("BUS-999");

    expect(await screen.findByText(ERROR_UBICACION)).toBeTruthy();
    expect(screen.queryByText("En ruta")).toBeNull();
  });

  it("muestra el tiempo estimado de llegada de un paradero", async () => {
    api.getEta.mockResolvedValue({ minutos: 8 });
    render(<Mapa />);

    consultarEta("P-045");

    expect(await screen.findByText("8 min")).toBeTruthy();
    expect(api.getEta).toHaveBeenCalledWith("P-045");
  });

  it("muestra un error cuando el ETA no está disponible", async () => {
    api.getEta.mockRejectedValue(new Error("Error en la petición: 404"));
    render(<Mapa />);

    consultarEta("P-000");

    expect(await screen.findByText(ERROR_ETA)).toBeTruthy();
  });

  it("borra el error anterior cuando la siguiente consulta funciona", async () => {
    api.getUbicacionBus.mockRejectedValueOnce(new Error("falló"));
    api.getUbicacionBus.mockResolvedValueOnce({ lat: 1, lng: 2 });
    render(<Mapa />);

    consultarUbicacion("BUS-1");
    expect(await screen.findByText(ERROR_UBICACION)).toBeTruthy();

    consultarUbicacion("BUS-1");
    expect(await screen.findByText("En ruta")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText(ERROR_UBICACION)).toBeNull());
  });
});
