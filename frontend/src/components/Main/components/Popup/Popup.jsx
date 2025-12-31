
import { useEffect } from "react";

function Popup({ isOpen = true, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) onClose();
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup popup_opened" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`popup__content ${!title ? "popup__content_content_image" : ""}`}>
        <button 
          aria-label="Cerrar modal" 
          className="popup__close" 
          type="button" 
          onClick={onClose} 
        />
        {title && <h3 className="popup__title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

export default Popup;