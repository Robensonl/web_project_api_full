const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [30, 'El nombre no puede exceder 30 caracteres'],
    default: 'Usuario',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: [true, 'Este email ya está registrado'],
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Email inválido'
    },
    index: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: [30, 'La descripción no puede exceder 30 caracteres'],
    default: 'Acerca de mí',
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ['http', 'https'] }),
      message: 'URL de avatar inválida'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }
  }
});

userSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);