const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [30, 'El nombre no puede exceder 30 caracteres'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'El enlace es requerido'],
    validate: {
      validator: (value) => validator.isURL(value, {
        protocols: ['http', 'https'],
        require_protocol: true
      }),
      message: 'URL inválida. Debe comenzar con http:// o https://'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para contar likes
cardSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Índices para mejorar rendimiento
cardSchema.index({ owner: 1, createdAt: -1 });
cardSchema.index({ likes: 1 });

module.exports = mongoose.model('Card', cardSchema);