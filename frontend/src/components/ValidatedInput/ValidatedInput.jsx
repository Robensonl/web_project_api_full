function ValidatedInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  minLength,
  maxLength,
  required = true,
  isAuthForm = false // Para login/register
}) {
  return (
    <label className="popup__field">
      <input
        className={`popup__input ${error ? 'popup__input_error' : ''} ${
          isAuthForm ? 'login__input' : ''
        } ${isAuthForm && error ? 'login__input_error' : ''}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
      />
      {error && <span className="popup__error">{error}</span>}
    </label>
  );
}

export default ValidatedInput;
