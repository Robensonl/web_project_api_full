import { useState } from 'react';
import { validators, validateForm, isFormValid } from '../../../../../utils/validation';
import ValidatedInput from '../../../../ValidatedInput/ValidatedInput';

function EditAvatar({ onUpdateAvatar, isLoading, onClose }) {
  const [formData, setFormData] = useState({
    avatar: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = {
    avatar: validators.url
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
    setTouched({ avatar: true });

    if (isFormValid(newErrors)) {
      onUpdateAvatar(formData);
    }
  };

  return (
    <form className="popup__form" name="avatar-form" id="edit-avatar-form" noValidate onSubmit={handleSubmit}>
      <ValidatedInput
        label="Avatar URL"
        name="avatar"
        type="url"
        value={formData.avatar}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.avatar ? errors.avatar : ''}
        placeholder="image link"
        disabled={isLoading}
      />
      <button 
        className="popup__button" 
        type="submit"
        disabled={isLoading || !isFormValid(errors) || !formData.avatar}
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default EditAvatar;