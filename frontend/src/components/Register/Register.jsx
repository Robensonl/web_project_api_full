import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validators, validateForm, isFormValid } from '../../utils/validation';
import ValidatedInput from '../ValidatedInput/ValidatedInput';

export default function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = {
    email: validators.email,
    password: validators.password
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validar en tiempo real si el campo fue tocado
    if (touched[name]) {
      const error = validationSchema[name](value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validationSchema[name](formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const newErrors = validateForm(formData, validationSchema);
    setErrors(newErrors);
    
    // Marcar todos como tocados
    setTouched({ email: true, password: true });

    if (isFormValid(newErrors)) {
      onRegister(formData.email, formData.password);
    }
  };

  return (
    <div className="Register">
      <h2 className="Register__title">Regístrate</h2>
      <form onSubmit={handleSubmit} className="Register__form">
        <ValidatedInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
          placeholder="Correo electrónico"
          isAuthForm={true}
        />
        <ValidatedInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          placeholder="Contraseña"
          isAuthForm={true}
        />
        <button 
          type="submit" 
          className="Register__button"
          disabled={!isFormValid(errors) || !formData.email || !formData.password}
        >
          Regístrate
        </button>
      </form>
      <p className="Register__text">
        ¿Ya eres miembro? <Link to="/signin" className="Register__link">Inicia sesión aquí</Link>
      </p>
    </div>
  );
}