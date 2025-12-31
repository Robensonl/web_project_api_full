function RemoveCard({ onConfirm, onCancel, isLoading }) {
  return (
    <div className="popup__confirm">
      <button 
        className="popup__button" 
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Eliminando..." : "Sí"}
      </button>
      <button 
        className="popup__button popup__button_type_cancel" 
        type="button"
        onClick={onCancel}
        disabled={isLoading}
      >
        No
      </button>
    </div>
  );
}

export default RemoveCard;