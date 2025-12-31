import { Link, useLocation } from 'react-router-dom';
import logo from '../../images/headerLogo.png';

export default function Header({ email, onSignOut }) {
  const location = useLocation();
  
  return (
    <header className="header page__section">
      <img src={logo} alt="Around the U.S logo" className="logo header__logo" />
      
      <div className="header__info">
        {location.pathname === '/signin' && (
          <Link to="/signup" className="header__link">
            Regístrate
          </Link>
        )}
        
        {location.pathname === '/signup' && (
          <Link to="/signin" className="header__link">
            Inicia sesión
          </Link>
        )}
        
        {location.pathname === '/' && (
          <div className="header__user">
            <span className="header__email">{email}</span>
            <button 
              className="header__button" 
              type="button" 
              onClick={onSignOut}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}