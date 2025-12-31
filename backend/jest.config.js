module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.spec.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middlewares/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 15000,
  verbose: true,
  // 🔧 Configuración para pruebas
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  // ⚠️ Ejecutar tests en serie para evitar conflictos de BD
  maxWorkers: 1,
  // 📌 Variables de entorno para pruebas
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};
