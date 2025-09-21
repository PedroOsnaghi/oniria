// test/usuario.controller.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { UsuarioController } from '../../src/controllers/usuario.controller';

// 🔧 Creamos un mock del UsuarioService
class MockUsuarioService {
    async saludar() {
        return 'Hola desde el mock!';
    }
}

// 🔧 Inyectamos el mock en el controlador
const controller = new UsuarioController(new MockUsuarioService() as any);

// 🔧 Preparamos una app Express solo para este test
const app = express();
app.get('/saludo', (req: Request, res: Response) => controller.saludar(req, res));

// 🧪 Test del endpoint
test('GET /saludo debe devolver saludo desde el service', async () => {
    const response = await request(app).get('/saludo');

    assert.equal(response.status, 200);
    assert.equal(response.text, 'Hola desde el mock!');
});