const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const mongoose = require('mongoose');

// Validación personalizada para URLs
const validateURL = (value, helpers) => {
  if (validator.isURL(value, { protocols: ['http', 'https'], require_protocol: true })) {
    return value;
  }
  return helpers.error('string.uri');
};

// Validación personalizada para emails
const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error('string.email');
};

// Validación personalizada para ObjectId
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('string.invalid_objectid');
  }
  return value;
};

// 🧾 ESQUEMAS DE VALIDACIÓN
const validationSchemas = {
  // Registro de usuario
  signup: celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail, 'Validación de email'),
      password: Joi.string().required().min(8).max(30),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().custom(validateURL, 'Validación de URL')
    })
  }),

  // Login
  signin: celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail, 'Validación de email'),
      password: Joi.string().required()
    })
  }),

  // Actualización de perfil
  updateProfile: celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required()
    })
  }),

  // Actualización de avatar
  updateAvatar: celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required().custom(validateURL, 'Validación de URL')
    })
  }),

  // Creación de tarjeta
  createCard: celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().custom(validateURL, 'Validación de URL')
    })
  }),

  // Validación de userId en params
  userId: celebrate({
    params: Joi.object().keys({
      userId: Joi.string().required().custom(validateObjectId, 'Validación de ObjectId')
    })
  }),

  // Validación de cardId en params
  cardId: celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().required().custom(validateObjectId, 'Validación de ObjectId')
    })
  })
};

module.exports = validationSchemas;