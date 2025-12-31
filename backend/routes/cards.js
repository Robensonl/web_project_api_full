const express = require('express');
const router = express.Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
} = require('../controllers/cards');
const validationSchemas = require('../middlewares/validation');

router.get('/', getCards);
router.post('/', validationSchemas.createCard, createCard);
router.delete('/:cardId', validationSchemas.cardId, deleteCard);
router.put('/:cardId/likes', validationSchemas.cardId, likeCard);
router.delete('/:cardId/likes', validationSchemas.cardId, dislikeCard);

module.exports = router;