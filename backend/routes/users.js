const express = require("express");

const router = express.Router();
const {
  getUsers,
  getUserById,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  logout,
} = require("../controllers/users");
const validationSchemas = require("../middlewares/validation");
const rbac = require("../middlewares/rbac");

// Admin-only: list all users
router.get("/", rbac("admin"), getUsers);
router.get("/me", getCurrentUser);
router.get("/:userId", validationSchemas.userId, getUserById);
router.patch("/me", validationSchemas.updateProfile, updateProfile);
router.patch("/me/avatar", validationSchemas.updateAvatar, updateAvatar);

// Zero-Trust: token revocation (logout)
router.post("/me/logout", logout);

module.exports = router;
