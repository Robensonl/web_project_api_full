import { useContext } from "react";
import Card from "../components/Main/Card/Card.jsx";
import { CurrentUserContext } from "../../src/contexts/CurrentUserContext";


function Main({
  cards,
  onEditProfile,
  onAddPlace,
  onEditAvatar,
  onCardLike,
  onCardDelete,
  onCardClick
}) {
  const currentUser = useContext(CurrentUserContext);

  // Verificar si el usuario actual dio like a una card
  const isLikedByCurrentUser = (card) => {
    return card.likes?.some(like => 
      like === currentUser._id || like._id === currentUser._id
    );
  };

  // Verificar si el usuario es el dueño de la card
  const isOwnCard = (card) => {
    return card.owner === currentUser._id || card.owner?._id === currentUser._id;
  };

  return (
    <main className="main">
      <section className="profile">
        <div className="profile__avatar-container">
          <img
            src={currentUser?.avatar || null } 
            alt="Avatar de usuario"
            className="profile__avatar"
          />
          <button
            aria-label="Editar avatar"
            className="profile__avatar-edit"
            type="button"
            onClick={onEditAvatar}
          />
        </div>

        <div className="profile__info">
          <div className="profile__name-container">
            <h1 className="profile__name">{currentUser?.name || 'Cargando...'}</h1>
            <button
              aria-label="Editar perfil"
              className="profile__edit-button"
              type="button"
              onClick={onEditProfile}
            />
          </div>
          <p className="profile__about">{currentUser?.about || 'Cargando...'}</p>
        </div>

        <button
          aria-label="Agregar tarjeta"
          className="profile__add-button"
          type="button"
          onClick={onAddPlace}
        />
      </section>

      <section className="cards">
        <ul className="cards__list">
          {cards && cards.length > 0 ? (
            cards.map((card) => (
              <Card
                key={card._id}
                card={card}
                onCardClick={() => onCardClick(card)}
                onCardLike={() => onCardLike(card)}
                onCardDelete={() => onCardDelete(card)}
                isLiked={isLikedByCurrentUser(card)}
                isOwn={isOwnCard(card)}
              />
            ))
          ) : (
          <p className="cards__empty">No hay tarjetas aún. ¡Crea la primera!</p>
          )}
        </ul>
      </section>
    </main>
  );
}

export default Main;
