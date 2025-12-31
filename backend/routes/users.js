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


router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validationSchemas.userId, getUserById);
router.patch('/me', validationSchemas.updateProfile, updateProfile);
router.patch('/me/avatar', validationSchemas.updateAvatar, updateAvatar);

module.exports = router;