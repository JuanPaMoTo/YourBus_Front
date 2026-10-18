import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Horarios from "../pages/Horarios";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({ api: { getHorarios: vi.fn() } }));

const ERROR = "No hay información de horarios para esta ruta.";
const VACIO = "No hay horarios registrados para esa ruta.";

function consultar(ruta) {
  fireEvent.change(screen.getByLabelText("Código o nombre de ruta"), {
    target: { value: ruta },
  });
  fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
}

// Pruebas de caja blanca: estado inicial, resultados, lista vacía, error y
// limpieza de la lista anterior cuando una consulta falla.
describe("Horarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("antes de buscar no muestra mensajes ni horarios", () => {
    render(<Horarios />);

    expect(screen.queryByText(VACIO)).toBeNull();
    expect(screen.queryByText(ERROR)).toBeNull();
    expect(api.getHorarios).not.toHaveBeenCalled();
  });

  it("muestra los horarios de la ruta consultada", async () => {
    api.getHorarios.mockResolvedValue([
      { id: 1, jornada: "Mañana", hora: "06:00" },
      { id: 2, jornada: "Tarde", hora: "15:30" },
    ]);
    render(<Horarios />);

    consultar("L4");

    expect(await screen.findByText("Mañana")).toBeTruthy();
    expect(screen.getByText("06:00")).toBeTruthy();
    expect(screen.getByText("Tarde")).toBeTruthy();
    expect(api.getHorarios).toHaveBeenCalledWith("L4");
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("avisa cuando la ruta no tiene horarios registrados", async () => {
    api.getHorarios.mockResolvedValue([]);
    render(<Horarios />);

    consultar("L9");

    expect(await screen.findByText(VACIO)).toBeTruthy();
  });

  it("muestra un error cuando la consulta falla, sin el aviso de lista vacía", async () => {
    api.getHorarios.mockRejectedValue(new Error("Error en la petición: 404"));
    render(<Horarios />);

    consultar("NO-EXISTE");

    expect(await screen.findByText(ERROR)).toBeTruthy();
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("vacía la lista anterior cuando la siguiente consulta falla", async () => {
    api.getHorarios.mockResolvedValueOnce([
      { id: 1, jornada: "Mañana", hora: "06:00" },
    ]);
    api.getHorarios.mockRejectedValueOnce(new Error("falló"));
    render(<Horarios />);

    consultar("L4");
    expect(await screen.findByText("Mañana")).toBeTruthy();

    consultar("L5");
    expect(await screen.findByText(ERROR)).toBeTruthy();
    expect(screen.queryByText("Mañana")).toBeNull();
  });
});
