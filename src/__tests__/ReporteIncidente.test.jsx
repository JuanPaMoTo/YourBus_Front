import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReporteIncidente from "../components/ReporteIncidente";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: { getRutas: vi.fn(), reportarIncidente: vi.fn() },
}));

const RUTAS = [
  { id: "r1", codigo: "L1", nombre: "Terminal Norte - Centro" },
  { id: "r2", codigo: "L2", nombre: "Centro - Sur" },
];

const abrir = async (props = {}) => {
  render(<ReporteIncidente {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Reportar incidente" }));
  await screen.findByText("L1 · Terminal Norte - Centro");
};

describe("ReporteIncidente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getRutas.mockResolvedValue(RUTAS);
  });

  it("empieza cerrado y no consulta las rutas hasta abrirse", () => {
    render(<ReporteIncidente />);
    expect(screen.getByRole("button", { name: "Reportar incidente" })).toBeTruthy();
    expect(screen.queryByLabelText("Descripción")).toBeNull();
    expect(api.getRutas).not.toHaveBeenCalled();
  });

  it("envía el reporte con tipo, ruta y descripción, y avisa que quedó registrado", async () => {
    api.reportarIncidente.mockResolvedValue({});
    await abrir();

    fireEvent.change(screen.getByLabelText("Tipo de incidente"), { target: { value: "accidente" } });
    fireEvent.change(screen.getByLabelText("Ruta afectada"), { target: { value: "r2" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Choque en la Av. Norte" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));

    expect(await screen.findByText(/Incidente reportado/)).toBeTruthy();
    expect(api.reportarIncidente).toHaveBeenCalledWith({
      rutaId: "r2",
      tipo: "accidente",
      descripcion: "Choque en la Av. Norte",
    });
    expect(screen.getByLabelText("Descripción").value).toBe("");
  });

  it("preselecciona la ruta del recorrido en curso", async () => {
    await abrir({ rutaSugerida: "r1" });
    expect(screen.getByLabelText("Ruta afectada").value).toBe("r1");
  });

  it("muestra el error del servidor y conserva lo escrito", async () => {
    api.reportarIncidente.mockRejectedValue(new Error("La ruta no existe"));
    await abrir({ rutaSugerida: "r1" });

    fireEvent.change(screen.getByLabelText("Tipo de incidente"), { target: { value: "otro" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Algo pasó" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));

    expect(await screen.findByText("La ruta no existe")).toBeTruthy();
    expect(screen.getByLabelText("Descripción").value).toBe("Algo pasó");
  });

  it("avisa si no se pueden cargar las rutas y se puede volver a cerrar", async () => {
    api.getRutas.mockRejectedValue(new Error("500"));
    render(<ReporteIncidente />);
    fireEvent.click(screen.getByRole("button", { name: "Reportar incidente" }));

    expect(await screen.findByText("No fue posible cargar las rutas.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.getByRole("button", { name: "Reportar incidente" })).toBeTruthy();
  });
});
