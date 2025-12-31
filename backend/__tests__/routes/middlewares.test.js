/**
 *PRUEBAS DE MIDDLEWARES
 *
 * Pruebas para:
 * - Middleware auth (autenticación con JWT)
 * - Middleware validation (validación de esquemas)
 * - Middleware errorHandler (manejo de errores)
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/around_project_test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/user');
const userFixtures = require('../fixtures/users');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('../helpers/db');

describe('Middlewares', () => {
  let testUser;
  let testToken;
  let uniqueEmail;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Email único para cada test
    uniqueEmail = `test-${Date.now()}@example.com`;

    testUser = await User.create({
      ...userFixtures.validUser,
      email: uniqueEmail
    });

    testToken = jwt.sign(
      { _id: testUser._id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '7d' }
    );
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('🔐 Middleware: auth (Autenticación JWT)', () => {
    // 🧪 PRUEBA #1: Token válido - Acceso permitido
    test('✅ Debería permitir acceso con token válido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
    });


    // 🧪 PRUEBA #2: Sin token - Acceso denegado
    test('❌ Debería rechazar sin token', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(401);
    });

    // 🧪 PRUEBA #3: Token malformado - Acceso denegado
    test('❌ Debería rechazar token malformado', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer malformed-token-xyz');

      expect(response.status).toBe(401);
    });
    // 🧪 PRUEBA #4: Token sin prefijo "Bearer" - Acceso denegado
    test('❌ Debería rechazar token sin prefijo Bearer', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', testToken);

      expect(response.status).toBe(401);
    });


    // 🧪 PRUEBA #5: Token expirado - Acceso denegado

    test('❌ Debería rechazar token expirado', async () => {
      const expiredToken = jwt.sign(
        { _id: testUser._id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    // 🧪 PRUEBA #6: req.user se asigna correctamente

    test('✅ Debería asignar usuario a req.user', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testUser._id.toString());
    });
  });

  describe('✔️ Middleware: validation (Validación de datos)', () => {
    // 🧪 PRUEBA #7: Datos válidos - Aceptados
    test('✅ Debería aceptar datos válidos', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Card',
          link: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(201);
    });
    // 🧪 PRUEBA #8: Campo vacío - Rechazado (400)
    test('❌ Debería rechazar campo vacío', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: '',
          link: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
    });

    // 🧪 PRUEBA #9: URL inválida - Rechazada (400)
    test('❌ Debería rechazar URL inválida', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Card',
          link: 'not-a-valid-url'
        });

      expect(response.status).toBe(400);
    });

    // 🧪 PRUEBA #10: Campo requerido ausente - Rechazado (400)
    test('❌ Debería rechazar campo requerido ausente', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Card'
        });

      expect(response.status).toBe(400);
    });
    // 🧪 PRUEBA #11: ObjectId inválido en params - Rechazado (400)
    test('❌ Debería rechazar ObjectId inválido en params', async () => {
      const response = await request(app)
        .get('/users/not-a-valid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
    });
    // 🧪 PRUEBA #12: Actualización con datos incompletos - Rechazada (400)
    test('❌ Debería rechazar actualización con datos incompletos', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'New Name'
        });

      expect(response.status).toBe(400);
    });

    // 🧪 PRUEBA #13: Actualización con nombre muy corto - Rechazada (400)
    test('❌ Debería rechazar nombre muy corto', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'A',
          about: 'Valid about text'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('⚠️ Middleware: errorHandler (Manejo de errores)', () => {
    // 🧪 PRUEBA #14: Error 404 - Usuario no encontrado
    test('❌ Debería retornar 404 para usuario no encontrado', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe(true);
    });
    // 🧪 PRUEBA #15: Error 403 - Permiso denegado
    test('❌ Debería retornar 403 para permiso denegado', async () => {
      // Crear otro usuario con su tarjeta
      const otherEmail = `other-${Date.now()}@example.com`;
      const otherUser = await User.create({
        ...userFixtures.anotherUser,
        email: otherEmail
      });

      const Card = require('../../models/card');
      const card = await Card.create({
        name: 'Other User Card',
        link: 'https://example.com/image.jpg',
        owner: otherUser._id
      });

      // Intentar eliminar con token de otro usuario
      const response = await request(app)
        .delete(`/cards/${card._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('permiso');
    });
    // 🧪 PRUEBA #16: Error 400 - Validación fallida
    test('❌ Debería retornar 400 para validación fallida', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: '',
          link: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(true);
    });
    // 🧪 PRUEBA #17: Error 401 - No autenticado
    test('❌ Debería retornar 401 sin autenticación', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(401);
    });
  });
});

