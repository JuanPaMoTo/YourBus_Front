import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Paraderos from "../pages/Paraderos";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({ api: { getParaderos: vi.fn() } }));

const ERROR = "No hay paraderos disponibles para esta ruta.";
const VACIO = "No se encontraron paraderos para esa ruta.";

function consultar(ruta) {
  fireEvent.change(screen.getByLabelText("Código de ruta"), {
    target: { value: ruta },
  });
  fireEvent.click(screen.getByRole("button", { name: "Consultar" }));
}

// Pruebas de caja blanca: estado inicial, resultados, lista vacía, error y
// limpieza de la lista anterior cuando una consulta falla.
describe("Paraderos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("antes de buscar no muestra mensajes ni paraderos", () => {
    render(<Paraderos />);

    expect(screen.queryByText(VACIO)).toBeNull();
    expect(screen.queryByText(ERROR)).toBeNull();
    expect(api.getParaderos).not.toHaveBeenCalled();
  });

  it("muestra los paraderos de la ruta consultada", async () => {
    api.getParaderos.mockResolvedValue([
      { id: 1, nombre: "Terminal Norte" },
      { id: 2, nombre: "Plaza Central" },
    ]);
    render(<Paraderos />);

    consultar("L4");

    expect(await screen.findByText("Terminal Norte")).toBeTruthy();
    expect(screen.getByText("Plaza Central")).toBeTruthy();
    expect(api.getParaderos).toHaveBeenCalledWith("L4");
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("avisa cuando la ruta no tiene paraderos", async () => {
    api.getParaderos.mockResolvedValue([]);
    render(<Paraderos />);

    consultar("L9");

    expect(await screen.findByText(VACIO)).toBeTruthy();
  });

  it("muestra un error cuando la consulta falla, sin el aviso de lista vacía", async () => {
    api.getParaderos.mockRejectedValue(new Error("Error en la petición: 404"));
    render(<Paraderos />);

    consultar("NO-EXISTE");

    expect(await screen.findByText(ERROR)).toBeTruthy();
    expect(screen.queryByText(VACIO)).toBeNull();
  });

  it("vacía la lista anterior cuando la siguiente consulta falla", async () => {
    api.getParaderos.mockResolvedValueOnce([
      { id: 1, nombre: "Terminal Norte" },
    ]);
    api.getParaderos.mockRejectedValueOnce(new Error("falló"));
    render(<Paraderos />);

    consultar("L4");
    expect(await screen.findByText("Terminal Norte")).toBeTruthy();

    consultar("L5");
    expect(await screen.findByText(ERROR)).toBeTruthy();
    expect(screen.queryByText("Terminal Norte")).toBeNull();
  });
});
