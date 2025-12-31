/**
 * 🧪 PRUEBAS DE ROUTES/CARDS.JS
 *
 * Pruebas para los 5 endpoints de tarjetas:
 * - GET /cards - Obtener todas las tarjetas
 * - POST /cards - Crear una tarjeta
 * - DELETE /cards/:cardId - Eliminar una tarjeta
 * - PUT /cards/:cardId/likes - Dar like a una tarjeta
 * - DELETE /cards/:cardId/likes - Quitar like a una tarjeta
 */


process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/around_project_test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../app');
const Card = require('../../models/card');
const User = require('../../models/user');
const cardFixtures = require('../fixtures/cards');
const userFixtures = require('../fixtures/users');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('../helpers/db');

describe('Routes: Cards (/cards)', () => {
  let testUser;
  let testUser2;
  let testToken;
  let testToken2;
  let testCard;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Crear dos usuarios de prueba
    testUser = await User.create({
      ...userFixtures.validUser,
      email: 'test1@example.com'
    });

    testUser2 = await User.create({
      ...userFixtures.anotherUser,
      email: 'test2@example.com'
    });

    // Generar tokens para ambos usuarios
    testToken = jwt.sign(
      { _id: testUser._id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '7d' }
    );

    testToken2 = jwt.sign(
      { _id: testUser2._id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '7d' }
    );

    // Crear una tarjeta de prueba propiedad de testUser
    testCard = await Card.create({
      ...cardFixtures.validCard,
      owner: testUser._id
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  // PRUEBA #1: Obtener todas las tarjetas

  test('✅ Debería obtener todas las tarjetas', async () => {
    const response = await request(app)
      .get('/cards')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('link');
    expect(response.body[0]).toHaveProperty('owner');
  });
  // 🧪 PRUEBA #2: Rechazar obtener tarjetas sin autenticación
  test('❌ Debería rechazar obtener tarjetas sin token', async () => {
    const response = await request(app).get('/cards');

    expect(response.status).toBe(401);
  });
  // PRUEBA #3: Crear una tarjeta
  test('✅ Debería crear una tarjeta', async () => {
    const response = await request(app)
      .post('/cards')
      .set('Authorization', `Bearer ${testToken}`)
      .send(cardFixtures.anotherCard);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('Ocean Sunset');
    expect(response.body.link).toBe('https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg');
    // Owner puede ser un objeto o un ID dependiendo del populate
    if (typeof response.body.owner === 'object' && response.body.owner._id) {
      expect(response.body.owner._id.toString()).toBe(testUser._id.toString());
    } else {
      expect(response.body.owner.toString()).toBe(testUser._id.toString());
    }
  });
  // PRUEBA #4: Rechazar crear tarjeta sin autenticación
  test('❌ Debería rechazar crear tarjeta sin token', async () => {
    const response = await request(app)
      .post('/cards')
      .send(cardFixtures.validCard);

    expect(response.status).toBe(401);
  });
  // 🧪 PRUEBA #5: Rechazar tarjeta con datos inválidos
  test('❌ Debería rechazar datos inválidos al crear tarjeta', async () => {
    const response = await request(app)
      .post('/cards')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: '',
        link: 'https://example.com/image.jpg'
      });

    expect(response.status).toBe(400);
  });

  // 🧪 PRUEBA #6: Eliminar una tarjeta (propietario)
  test('✅ Debería eliminar una tarjeta (propietario)', async () => {
    const response = await request(app)
      .delete(`/cards/${testCard._id}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    // Verificar que la tarjeta fue eliminada
    const deletedCard = await Card.findById(testCard._id);
    expect(deletedCard).toBeNull();
  });

  // 🧪 PRUEBA #7: Rechazar eliminar tarjeta no existente
  test('❌ Debería retornar 404 al eliminar tarjeta no existente', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/cards/${fakeId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(404);
  });
  //PRUEBA #8: Rechazar eliminar tarjeta (no propietario)
  test('❌ Debería rechazar eliminar tarjeta (no propietario)', async () => {
    // Crear un segundo usuario
    const anotherUserData = {
      ...userFixtures.anotherUser,
      email: `test2-${Date.now()}@example.com`
    };
    const otherUser = await User.create(anotherUserData);
    const otherToken = jwt.sign(
      { _id: otherUser._id },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '7d' }
    );

    const response = await request(app)
      .delete(`/cards/${testCard._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('permiso');

    // Verificar que la tarjeta NO fue eliminada
    const card = await Card.findById(testCard._id);
    expect(card).not.toBeNull();
  });
  //PRUEBA #9: Rechazar ID de tarjeta inválido
  test('❌ Debería rechazar ID de tarjeta inválido', async () => {
    const response = await request(app)
      .delete('/cards/invalidId123')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(400);
  });
  //PRUEBA #10: Dar like a una tarjeta
  test('✅ Debería dar like a una tarjeta', async () => {
    const response = await request(app)
      .put(`/cards/${testCard._id}/likes`)
      .set('Authorization', `Bearer ${testUser2._id ? testToken2 : testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('likes');
    expect(Array.isArray(response.body.likes)).toBe(true);
  });
  //PRUEBA #11: Rechazar like sin autenticación
  test('❌ Debería rechazar like sin token', async () => {
    const response = await request(app)
      .put(`/cards/${testCard._id}/likes`);

    expect(response.status).toBe(401);
  });
  // 🧪 PRUEBA #12: Dar like a tarjeta no existente
  test('❌ Debería retornar 404 al dar like a tarjeta no existente', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/cards/${fakeId}/likes`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(404);
  });
  //PRUEBA #13: Quitar like a una tarjeta
  test('✅ Debería quitar like a una tarjeta', async () => {
    // Primero agregar un like
    await request(app)
      .put(`/cards/${testCard._id}/likes`)
      .set('Authorization', `Bearer ${testToken2}`);

    // Luego quitar el like
    const response = await request(app)
      .delete(`/cards/${testCard._id}/likes`)
      .set('Authorization', `Bearer ${testToken2}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('likes');
    expect(Array.isArray(response.body.likes)).toBe(true);
  });
  //PRUEBA #14: Rechazar quitar like sin autenticación
  test('❌ Debería rechazar quitar like sin token', async () => {
    const response = await request(app)
      .delete(`/cards/${testCard._id}/likes`);

    expect(response.status).toBe(401);
  });

  //PRUEBA #15: Quitar like a tarjeta no existente
  test('❌ Debería retornar 404 al quitar like a tarjeta no existente', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/cards/${fakeId}/likes`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(404);
  });
});
