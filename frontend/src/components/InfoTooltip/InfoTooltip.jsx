import Popup from '../../components/Main/components/Popup/Popup'; 
import successIcon from '../../images/success-icon.png';
import errorIcon from '../../images/error-icon.png';

export default function InfoTooltip({ isOpen, onClose, isSuccess }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title={null}>
      <div className="popup__container_tooltip">
        <img 
          src={isSuccess ? successIcon : errorIcon} 
          alt={isSuccess ? 'Éxito' : 'Error'} 
          className="popup__icon" 
        />
        
        <h2 className="popup__title popup__title_center">
          {isSuccess 
            ? '¡Correcto! Ya estás registrado.' 
            : 'Uy, algo salió mal. Por favor, inténtalo de nuevo.'
          }
        </h2>
      </div>
    </Popup>
  );
}