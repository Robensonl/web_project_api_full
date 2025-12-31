// Patrones de validación
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  name: /^.{2,40}$/,
  password: /^.{6,}$/ // Mínimo 6 caracteres
};

// Validadores
export const validators = {
  email: (value) => {
    if (!value) return 'El email es requerido';
    if (!PATTERNS.email.test(value)) return 'Email inválido';
    return '';
  },

  password: (value) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return '';
  },

  name: (value) => {
    if (!value) return 'El nombre es requerido';
    if (value.length < 2) return 'Mínimo 2 caracteres';
    if (value.length > 40) return 'Máximo 40 caracteres';
    return '';
  },

  cardName: (value) => {
    if (!value) return 'El título es requerido';
    if (value.length < 2) return 'Mínimo 2 caracteres';
    if (value.length > 30) return 'Máximo 30 caracteres';
    return '';
  },

  url: (value) => {
    if (!value) return 'La URL es requerida';
    if (!PATTERNS.url.test(value)) return 'URL inválida (debe empezar con http:// o https://)';
    return '';
  },

  about: (value) => {
    if (!value) return 'Este campo es requerido';
    if (value.length < 2) return 'Mínimo 2 caracteres';
    if (value.length > 200) return 'Máximo 200 caracteres';
    return '';
  }
};

// Validar múltiples campos
export const validateForm = (formData, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const validator = schema[field];
    const error = validator(formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Verificar si el formulario es válido
export const isFormValid = (errors) => {
  return Object.values(errors).every(error => !error);
};
