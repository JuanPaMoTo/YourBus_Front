// @vitest-environment node
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const original = require('../../deploy/server.cjs');

// Copia el servidor a una carpeta temporal con un index.html y un asset de prueba,
// tal como queda en /home/site/wwwroot después del despliegue.
let base;
let server;

beforeAll(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yourbus-front-'));
  fs.copyFileSync(require.resolve('../../deploy/server.cjs'), path.join(dir, 'server.cjs'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>YourBus</title>');
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'assets', 'app-abc123.js'), 'console.log(1)');
  fs.writeFileSync(path.join(dir, 'robots.txt'), 'User-agent: *\nAllow: /\n');

  const { crearServidor } = require(path.join(dir, 'server.cjs'));
  server = crearServidor();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe('deploy/server.cjs', () => {
  it('envía las cabeceras de seguridad en todas las respuestas', async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    for (const [nombre, valor] of Object.entries(original.SECURITY_HEADERS)) {
      expect(res.headers.get(nombre)).toBe(valor);
    }
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('la CSP bloquea iframes externos y scripts de terceros', () => {
    expect(original.CSP).toContain("frame-ancestors 'none'");
    expect(original.CSP).toContain("script-src 'self'");
  });

  it('devuelve index.html para rutas de React Router (SPA)', async () => {
    const res = await fetch(`${base}/admin/turnos`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('cache-control')).toBe('no-cache');
  });

  it('cachea un año los assets con hash', async () => {
    const res = await fetch(`${base}/assets/app-abc123.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('immutable');
  });

  it('sirve robots.txt como texto y no como index.html', async () => {
    const res = await fetch(`${base}/robots.txt`);
    expect(res.headers.get('content-type')).toContain('text/plain');
    expect(await res.text()).toContain('User-agent');
  });

  it('responde 404 a archivos inexistentes y no expone el propio servidor', async () => {
    expect((await fetch(`${base}/no-existe.js`)).status).toBe(404);
    expect((await fetch(`${base}/server.cjs`)).status).toBe(404);
    expect((await fetch(`${base}/..%2F..%2Fetc%2Fpasswd`)).status).toBe(404);
  });

  it('rechaza métodos distintos de GET y HEAD', async () => {
    const res = await fetch(`${base}/`, { method: 'POST' });
    expect(res.status).toBe(405);
  });
});
