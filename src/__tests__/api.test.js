import { afterEach, describe, expect, it, vi } from "vitest";
import { api, BACKENDS_POR_DOMINIO, resolverApiUrl } from "../services/api";

const FRONT_DEV =
  "yourbus-front-dev-cvesf3apbsa9gpcg.chilecentral-01.azurewebsites.net";
const FRONT_QA =
  "yourbus-front-qa-b4cue0d0a9c0ghc0.chilecentral-01.azurewebsites.net";
const FRONT_PROD =
  "yourbus-front-prod-ckeqapbpexdpfkbb.chilecentral-01.azurewebsites.net";

// Pruebas de caja blanca: cada prueba recorre una rama distinta del código
// de src/services/api.js (selección del backend, éxito, error y POST).
describe("resolverApiUrl: selección del backend", () => {
  it("usa el backend de DEV en el dominio del front de DEV", () => {
    expect(resolverApiUrl(FRONT_DEV, undefined)).toContain("yourbus-back-dev");
  });

  it("usa el backend de QA en el dominio del front de QA", () => {
    expect(resolverApiUrl(FRONT_QA, undefined)).toContain("yourbus-back-qa2");
  });

  it("usa el backend de PROD en el dominio del front de PROD", () => {
    expect(resolverApiUrl(FRONT_PROD, undefined)).toContain(
      "yourbus-back-prod",
    );
  });

  it("todos los backends configurados terminan en /api", () => {
    Object.values(BACKENDS_POR_DOMINIO).forEach((url) => {
      expect(url.endsWith("/api")).toBe(true);
    });
  });

  it("en un dominio desconocido usa VITE_API_URL si existe", () => {
    expect(resolverApiUrl("localhost", "http://mi-api.test/api")).toBe(
      "http://mi-api.test/api",
    );
  });

  it("sin dominio conocido ni VITE_API_URL usa el valor por defecto local", () => {
    expect(resolverApiUrl("localhost", undefined)).toBe(
      "http://localhost:4000/api",
    );
  });

  it("el dominio conocido tiene prioridad sobre VITE_API_URL", () => {
    expect(resolverApiUrl(FRONT_QA, "http://mi-api.test/api")).toBe(
      BACKENDS_POR_DOMINIO[FRONT_QA],
    );
  });
});

describe("api: peticiones al backend", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getRutas devuelve el JSON cuando la respuesta es correcta", async () => {
    const datos = [{ id: 1, nombre: "Ruta 1" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => datos });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.getRutas()).resolves.toEqual(datos);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/rutas$/);
  });

  it("getParaderos arma la ruta con el id recibido", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    await api.getParaderos(7);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/rutas\/7\/paraderos$/);
  });

  it("lanza un error cuando el servidor responde con un código de error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(api.getRutas()).rejects.toThrow("Error en la petición: 500");
  });

  it("registrarBus envía un POST con el cuerpo en JSON", async () => {
    const bus = { placa: "ABC123", ruta: "R1" };
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
    vi.stubGlobal("fetch", fetchMock);

    await api.registrarBus(bus);
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/buses$/);
    expect(opciones.method).toBe("POST");
    expect(opciones.body).toBe(JSON.stringify(bus));
    expect(opciones.headers["Content-Type"]).toBe("application/json");
  });
});

describe("api: el resto de los endpoints", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["getHorarios", 3, /\/rutas\/3\/horarios$/],
    ["getUbicacionBus", 5, /\/buses\/5\/ubicacion$/],
    ["getEta", 9, /\/paraderos\/9\/eta$/],
    ["getEstadoRuta", 2, /\/rutas\/2\/estado$/],
  ])("%s llama a la dirección correcta", async (metodo, id, patron) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await api[metodo](id);
    expect(fetchMock.mock.calls[0][0]).toMatch(patron);
  });
});
