// 🔧 SETUP - Configuración que se ejecuta ANTES de todas las pruebas

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/web_project_test';

// ⏱️ Aumentar timeout para operaciones de BD
jest.setTimeout(15000);
