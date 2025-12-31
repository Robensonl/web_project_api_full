const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar
} = require('../controllers/users');
const validationSchemas = require('../middlewares/validation');

// Rutas protegidas
// ⚠️ IMPORTANTE: Las rutas más específicas deben ir ANTES de las rutas con parámetros
router.get('/', getUsers);
router.get('/me', getCurrentUser); // Específica - ANTES de /:userId
router.get('/:userId', validationSchemas.userId, getUserById);
router.patch('/me', validationSchemas.updateProfile, updateProfile); // Específica
router.patch('/me/avatar', validationSchemas.updateAvatar, updateAvatar);

module.exports = router;