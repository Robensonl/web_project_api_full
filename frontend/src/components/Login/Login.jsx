import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validators, validateForm, isFormValid } from '../../utils/validation';
import ValidatedInput from '../ValidatedInput/ValidatedInput';

export default function Login({ onLogin }) {
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
      onLogin(formData.email, formData.password);
    }
  };

  return (
    <div className="login">
      <h2 className="login__title">Inicia sesión</h2>
      <form onSubmit={handleSubmit} className="login__form">
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
          className="login__button"
          disabled={!isFormValid(errors) || !formData.email || !formData.password}
        >
          Inicia sesión
        </button>
      </form>
      <p className="login__text">
        ¿Aún no eres miembro? <Link to="/signup" className="login__link">Regístrate aquí</Link>
      </p>
    </div>
  );
}