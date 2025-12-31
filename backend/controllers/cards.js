const Card = require('../models/card');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({})
      .populate('owner', 'name about avatar')
      .populate('likes', 'name about avatar');
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;

    const card = await Card.create({
      name,
      link,
      owner: req.user._id
    });

    // Populate después de crear
    await card.populate('owner', 'name about avatar');

    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      const error = new Error('Tarjeta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que el usuario sea el dueño
    if (card.owner.toString() !== req.user._id) {
      const error = new Error('No tienes permiso para eliminar esta tarjeta');
      error.statusCode = 403;
      throw error;
    }

    await Card.findByIdAndDelete(req.params.cardId);

    res.json({ message: 'Tarjeta eliminada exitosamente' });
  } catch (err) {
    next(err);
  }
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
      .populate('owner', 'name about avatar')
      .populate('likes', 'name about avatar');

    if (!card) {
      const error = new Error('Tarjeta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
      .populate('owner', 'name about avatar')
      .populate('likes', 'name about avatar');

    if (!card) {
      const error = new Error('Tarjeta no encontrada');
      error.statusCode = 404;
      throw error;
    }

    res.json(card);
  } catch (err) {
    next(err);
  }
};