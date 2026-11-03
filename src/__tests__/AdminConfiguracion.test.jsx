import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminConfiguracion from "../pages/AdminConfiguracion";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getRutas: vi.fn(),
    getParaderos: vi.fn(),
    getHorarios: vi.fn(),
    agregarParadero: vi.fn(),
    editarParadero: vi.fn(),
    eliminarParadero: vi.fn(),
    agregarHorario: vi.fn(),
    editarHorario: vi.fn(),
    eliminarHorario: vi.fn(),
  },
}));

const RUTAS = [{ id: "r1", codigo: "L1", nombre: "Terminal Norte - Centro" }];
const PARADEROS = [
  { id: "p1", nombre: "Terminal Norte", orden: 1 },
  { id: "p2", nombre: "Plaza Central", orden: 2 },
];
const HORARIOS = [{ id: "h1", jornada: "Mañana", hora: "06:00 - 09:00" }];

const elegirRuta = async () => {
  render(<AdminConfiguracion />);
  await screen.findByText("L1 · Terminal Norte - Centro");
  fireEvent.change(screen.getByLabelText("Ruta"), { target: { value: "r1" } });
};

describe("AdminConfiguracion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getRutas.mockResolvedValue(RUTAS);
    api.getParaderos.mockResolvedValue(PARADEROS);
    api.getHorarios.mockResolvedValue(HORARIOS);
  });

  it("no muestra nada de configuración hasta elegir una ruta", async () => {
    render(<AdminConfiguracion />);
    await screen.findByText("L1 · Terminal Norte - Centro");
    expect(screen.queryByText("Agregar paradero")).toBeNull();
    expect(api.getParaderos).not.toHaveBeenCalled();
  });

  it("al elegir una ruta muestra sus paraderos en orden y sus horarios", async () => {
    await elegirRuta();

    expect(await screen.findByText("Terminal Norte")).toBeTruthy();
    expect(screen.getByText("Plaza Central")).toBeTruthy();
    expect(screen.getByText("Mañana")).toBeTruthy();
    expect(screen.getByText("06:00 - 09:00")).toBeTruthy();
    expect(api.getParaderos).toHaveBeenCalledWith("r1");
    expect(api.getHorarios).toHaveBeenCalledWith("r1");
  });

  it("agrega un paradero con posición y coordenadas como números", async () => {
    api.agregarParadero.mockResolvedValue({});
    await elegirRuta();
    await screen.findByText("Terminal Norte");

    fireEvent.change(screen.getByLabelText("Nombre del paradero"), { target: { value: "Biblioteca" } });
    fireEvent.change(screen.getByLabelText("Posición (opcional)"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Latitud (opcional)"), { target: { value: "4.9" } });
    fireEvent.change(screen.getByLabelText("Longitud (opcional)"), { target: { value: "-74.03" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar paradero" }));

    expect(await screen.findByText("Paradero agregado.")).toBeTruthy();
    expect(api.agregarParadero).toHaveBeenCalledWith("r1", {
      nombre: "Biblioteca",
      orden: 2,
      lat: 4.9,
      lng: -74.03,
    });
    expect(screen.getByLabelText("Nombre del paradero").value).toBe("");
  });

  it("sin posición ni coordenadas solo envía el nombre", async () => {
    api.agregarParadero.mockResolvedValue({});
    await elegirRuta();
    await screen.findByText("Terminal Norte");

    fireEvent.change(screen.getByLabelText("Nombre del paradero"), { target: { value: "Final" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar paradero" }));

    await screen.findByText("Paradero agregado.");
    expect(api.agregarParadero).toHaveBeenCalledWith("r1", { nombre: "Final" });
  });

  it("muestra el error del servidor al agregar y conserva lo escrito", async () => {
    api.agregarParadero.mockRejectedValue(new Error("Indica la latitud y la longitud juntas"));
    await elegirRuta();
    await screen.findByText("Terminal Norte");

    fireEvent.change(screen.getByLabelText("Nombre del paradero"), { target: { value: "X" } });
    fireEvent.change(screen.getByLabelText("Latitud (opcional)"), { target: { value: "4.9" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar paradero" }));

    expect((await screen.findByRole("alert")).textContent).toContain("latitud y la longitud");
    expect(screen.getByLabelText("Nombre del paradero").value).toBe("X");
  });

  it("sube y baja paraderos, y no deja mover los extremos", async () => {
    api.editarParadero.mockResolvedValue({});
    await elegirRuta();
    await screen.findByText("Plaza Central");

    expect(screen.getByRole("button", { name: "Subir Terminal Norte" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Bajar Plaza Central" }).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Subir Plaza Central" }));
    await vi.waitFor(() => expect(api.editarParadero).toHaveBeenCalledWith("p2", { orden: 1 }));

    // mientras se guarda, los botones quedan bloqueados: esperar a que se liberen
    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Bajar Terminal Norte" }).disabled).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "Bajar Terminal Norte" }));
    await vi.waitFor(() => expect(api.editarParadero).toHaveBeenCalledWith("p1", { orden: 2 }));
  });

  it("pide confirmación antes de eliminar un paradero", async () => {
    api.eliminarParadero.mockResolvedValue(null);
    await elegirRuta();
    await screen.findByText("Plaza Central");

    fireEvent.click(screen.getByRole("button", { name: "Eliminar Plaza Central" }));
    expect(api.eliminarParadero).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Eliminar Plaza Central" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar Plaza Central" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar eliminar Plaza Central" }));
    expect(await screen.findByText("Paradero eliminado.")).toBeTruthy();
    expect(api.eliminarParadero).toHaveBeenCalledWith("p2");
  });

  it("agrega un horario y muestra el aviso si ya existe", async () => {
    api.agregarHorario.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("Ese horario ya existe para la ruta"));
    await elegirRuta();
    await screen.findByText("Mañana");

    fireEvent.change(screen.getByLabelText("Jornada"), { target: { value: "Tarde" } });
    fireEvent.change(screen.getByLabelText("Horario"), { target: { value: "14:00 - 18:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar horario" }));
    expect(await screen.findByText("Horario agregado.")).toBeTruthy();
    expect(api.agregarHorario).toHaveBeenCalledWith("r1", { jornada: "Tarde", hora: "14:00 - 18:00" });

    fireEvent.change(screen.getByLabelText("Jornada"), { target: { value: "Tarde" } });
    fireEvent.change(screen.getByLabelText("Horario"), { target: { value: "14:00 - 18:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar horario" }));
    expect((await screen.findByRole("alert")).textContent).toContain("ya existe");
  });

  it("edita un horario y guarda los cambios", async () => {
    api.editarHorario.mockResolvedValue({});
    await elegirRuta();
    await screen.findByText("Mañana");

    fireEvent.click(screen.getByRole("button", { name: "Editar Mañana" }));
    const fila = screen.getByRole("button", { name: "Guardar" }).closest("form");
    fireEvent.change(within(fila).getByLabelText("Horario"), { target: { value: "06:30 - 09:30" } });
    fireEvent.click(within(fila).getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Horario actualizado.")).toBeTruthy();
    expect(api.editarHorario).toHaveBeenCalledWith("h1", { jornada: "Mañana", hora: "06:30 - 09:30" });
  });

  it("permite cancelar la edición y eliminar un horario con confirmación", async () => {
    api.eliminarHorario.mockResolvedValue(null);
    await elegirRuta();
    await screen.findByText("Mañana");

    fireEvent.click(screen.getByRole("button", { name: "Editar Mañana" }));
    const fila = screen.getByRole("button", { name: "Guardar" }).closest("form");
    fireEvent.click(within(fila).getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Editar Mañana" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar Mañana" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar eliminar Mañana" }));
    expect(await screen.findByText("Horario eliminado.")).toBeTruthy();
    expect(api.eliminarHorario).toHaveBeenCalledWith("h1");
  });

  it("avisa cuando una ruta no tiene paraderos ni horarios", async () => {
    api.getParaderos.mockResolvedValue([]);
    api.getHorarios.mockResolvedValue([]);
    await elegirRuta();

    expect(await screen.findByText("Esta ruta aún no tiene paraderos.")).toBeTruthy();
    expect(screen.getByText("Esta ruta aún no tiene horarios.")).toBeTruthy();
  });

  it("muestra un error si no se pueden cargar las rutas", async () => {
    api.getRutas.mockRejectedValue(new Error("500"));
    render(<AdminConfiguracion />);
    expect((await screen.findByRole("alert")).textContent).toContain("No fue posible cargar las rutas.");
  });
});
