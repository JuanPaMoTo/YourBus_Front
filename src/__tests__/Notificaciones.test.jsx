import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Notificaciones from "../pages/Notificaciones";

// Página sin lógica: la prueba comprueba que el contenido fijo se dibuja.
describe("Notificaciones", () => {
  it("muestra el título y el aviso de que no hay alertas activas", () => {
    render(<Notificaciones />);

    expect(
      screen.getByRole("heading", { name: "Alertas del servicio" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/No hay alertas activas en este momento/),
    ).toBeTruthy();
  });
});
