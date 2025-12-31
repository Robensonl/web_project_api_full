import { useState } from 'react';
import { validators, validateForm, isFormValid } from '../../../../../utils/validation';
import ValidatedInput from '../../../../ValidatedInput/ValidatedInput';

function NewCard({ onAddCard, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    link: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validationSchema = {
    name: validators.cardName,
    link: validators.url
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
    setTouched({ name: true, link: true });

    if (isFormValid(newErrors)) {
      onAddCard(formData);
      setFormData({ name: '', link: '' });
      setErrors({});
      setTouched({});
    }
  };

  return (
    <form className="popup__form" name="card-form" id="new-card-form" noValidate onSubmit={handleSubmit}>
      <ValidatedInput
        label="Card Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name ? errors.name : ''}
        placeholder="Title"
        disabled={isLoading}
        minLength="2"
        maxLength="30"
      />
      <ValidatedInput
        label="Image Link"
        name="link"
        type="url"
        value={formData.link}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.link ? errors.link : ''}
        placeholder="image link"
        disabled={isLoading}
      />
      <button 
        className="button popup__button" 
        type="submit"
        disabled={isLoading || !isFormValid(errors) || !formData.name || !formData.link}
      >
        {isLoading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}

export default NewCard;