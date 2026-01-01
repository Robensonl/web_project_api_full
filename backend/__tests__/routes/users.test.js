/**
 * 🧪 PRUEBAS DE ROUTES/USERS.JS
 */

// ⚠️ IMPORTANTE: Establecer NODE_ENV ANTES de importar app
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

describe('Routes: GET /users', () => {
  let testUser;
  let testToken;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = await User.create({
      ...userFixtures.validUser,
      email: 'test@example.com'
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

  test('✅ Debería obtener todos los usuarios', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('❌ Debería rechazar sin token de autenticación', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(401);
  });

  test('✅ Debería obtener el usuario actual (/me)', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('email');
    expect(response.body.email).toBe('test@example.com');
  });

  test('✅ Debería obtener un usuario por ID', async () => {
    const user = await User.create({
      ...userFixtures.anotherUser,
      email: 'another@test.com'
    });

    const response = await request(app)
      .get(`/users/${user._id}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body._id.toString()).toBe(user._id.toString());
    expect(response.body.name).toBe('Another User');
  });

  test('❌ Debería rechazar un ID de usuario inválido', async () => {
    const response = await request(app)
      .get('/users/invalidId123')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(400);
  });

  test('❌ Debería devolver 404 para usuario no existente', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/users/${fakeId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(404);
  });

  test('✅ Debería actualizar el perfil del usuario', async () => {
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Nuevo Nombre',
        about: 'Nueva biografía'
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Nuevo Nombre');
    expect(response.body.about).toBe('Nueva biografía');
  });

  test('✅ Debería actualizar el avatar del usuario', async () => {
    const newAvatar = 'https://example.com/new-avatar.jpg';

    const response = await request(app)
      .patch('/users/me/avatar')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ avatar: newAvatar });

    expect(response.status).toBe(200);
    expect(response.body.avatar).toBe(newAvatar);
  });

  test('❌ Debería rechazar datos inválidos en actualización', async () => {
    const response = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: '',
        about: 'Bio'
      });

    expect(response.status).toBe(400);
  });

  test('❌ Debería rechazar actualización sin token', async () => {
    const response = await request(app)
      .patch('/users/me')
      .send({ name: 'Nuevo Nombre' });

    expect(response.status).toBe(401);
  });
});

