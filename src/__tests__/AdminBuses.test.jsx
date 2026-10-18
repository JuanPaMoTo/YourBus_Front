import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminBuses from "../pages/AdminBuses";
import { api } from "../services/api";

// Se reemplaza la API por un simulacro: la prueba no usa red ni backend.
vi.mock("../services/api", () => ({ api: { registrarBus: vi.fn() } }));

function llenarFormulario(placa, empresa) {
  fireEvent.change(screen.getByLabelText("Placa"), {
    target: { value: placa },
  });
  fireEvent.change(screen.getByLabelText("Empresa"), {
    target: { value: empresa },
  });
}

// Pruebas de caja blanca: cada prueba recorre una rama de AdminBuses.jsx
// (formulario inicial, registro correcto y registro con error).
describe("AdminBuses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el formulario sin ningún mensaje al inicio", () => {
    render(<AdminBuses />);

    expect(screen.getByLabelText("Placa")).toBeTruthy();
    expect(screen.getByLabelText("Empresa")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Guardar bus" })).toBeTruthy();
    expect(screen.queryByText("Bus registrado correctamente.")).toBeNull();
  });

  it("actualiza los campos mientras el usuario escribe", () => {
    render(<AdminBuses />);

    llenarFormulario("ABCD-12", "Transportes Norte");

    expect(screen.getByLabelText("Placa").value).toBe("ABCD-12");
    expect(screen.getByLabelText("Empresa").value).toBe("Transportes Norte");
  });

  it("registra el bus, muestra el éxito y limpia el formulario", async () => {
    api.registrarBus.mockResolvedValue({});
    render(<AdminBuses />);

    llenarFormulario("ABCD-12", "Transportes Norte");
    fireEvent.click(screen.getByRole("button", { name: "Guardar bus" }));

    const mensaje = await screen.findByText("Bus registrado correctamente.");
    expect(mensaje.className).toContain("success");
    expect(api.registrarBus).toHaveBeenCalledWith({
      placa: "ABCD-12",
      empresa: "Transportes Norte",
    });
    expect(screen.getByLabelText("Placa").value).toBe("");
    expect(screen.getByLabelText("Empresa").value).toBe("");
  });

  it("muestra un error y conserva los datos cuando el registro falla", async () => {
    api.registrarBus.mockRejectedValue(new Error("Error en la petición: 409"));
    render(<AdminBuses />);

    llenarFormulario("ABCD-12", "Transportes Norte");
    fireEvent.click(screen.getByRole("button", { name: "Guardar bus" }));

    const mensaje = await screen.findByText(
      "No fue posible registrar el bus. Revisa los datos.",
    );
    expect(mensaje.className).toContain("error");
    expect(screen.getByLabelText("Placa").value).toBe("ABCD-12");
  });
});
