import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <label className="popup__field">
      <div className="password__wrapper">
        <input
          className={`popup__input ${error ? 'popup__input_error' : ''} ${
            isAuthForm ? 'login__input' : ''
          } ${isAuthForm && error ? 'login__input_error' : ''}`}
          type={inputType}
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
        {type === 'password' && (
          <button
            type="button"
            className="password__toggle"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <svg
              className="password__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      {error && <span className="popup__error">{error}</span>}
    </label>
  );
}

export default ValidatedInput;
