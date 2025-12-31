import { useState, useContext } from 'react';
import { CurrentUserContext } from '../../../../../contexts/CurrentUserContext';
import { validators, validateForm, isFormValid } from '../../../../../utils/validation';
import ValidatedInput from '../../../../ValidatedInput/ValidatedInput';

function EditProfile({ onUpdateUser, isLoading, onClose }) {
  const currentUser = useContext(CurrentUserContext);
  const [formData, setFormData] = useState({
    name: '',
    about: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = {
    name: validators.name,
    about: validators.about
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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
    
    const newErrors = validateForm(formData, validationSchema);
    setErrors(newErrors);
    setTouched({ name: true, about: true });

    if (isFormValid(newErrors)) {
      onUpdateUser(formData);
    }
  };

  return (
    <form className="popup__form" name="profile-form" onSubmit={handleSubmit}>
      <ValidatedInput
        label="Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : ''}
        placeholder="Nombre"
        disabled={isLoading}
        minLength="2"
        maxLength="40"
      />
      <ValidatedInput
        label="About"
        name="about"
        type="text"
        value={formData.about}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.about ? errors.about : ''}
        placeholder="Acerca de mí"
        disabled={isLoading}
        minLength="2"
        maxLength="200"
      />
      <button 
        className="popup__button" 
        type="submit"
        disabled={isLoading || !isFormValid(errors) || !formData.name || !formData.about}
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default EditProfile;