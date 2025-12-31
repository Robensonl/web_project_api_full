function ImagePopup({ card }) {
  if (!card) return null;

  return (
    <>
      <img className="popup__image" src={card.link} alt={card.name} />
      <p className="popup__caption">{card.name}</p>
    </>
  );
}

export default ImagePopup;