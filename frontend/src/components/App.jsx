import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation} from 'react-router-dom';

import { CurrentUserContext } from '../contexts/CurrentUserContext';
import Header from "./Header/Header.jsx"
import Main from './Main.jsx';
import Footer from './Footer/Footer.jsx';
import Login from './Login/Login.jsx';
import Register from './Register/Register.jsx';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute.jsx';
import InfoTooltip from './InfoTooltip/InfoTooltip.jsx';
import Popup from './Main/components/Popup/Popup.jsx';
import NewCard from './Main/components/Popup/NewCard/NewCard.jsx';
import EditProfile from './Main/components/Popup/EditProfile/EditProfile.jsx';
import EditAvatar from './Main/components/Popup/EditAvatar/EditAvatar.jsx';
import ImagePopup from './Main/components/Popup/ImagePopup/ImagePopup.jsx';
import RemoveCard from './Main/components/Popup/RemoveCard/RemoveCard.jsx';




import api from '../utils/api';
import * as auth from '../utils/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    name: '',
    about: '',
    avatar: '',
    _id: '',
    email: ''
  });
  
  const [cards, setCards] = useState([]);
  const [popup, setPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const token = localStorage.getItem('jwt');
    
    if (token) {
      // Verificar token llamando a API
      api.getUserInfo()
        .then((userData) => {
          setLoggedIn(true);
          setUserEmail(userData.email);
          setCurrentUser(userData);
          
          // Cargar cards
          return api.getInitialCards();
        })
        .then((cardsData) => {
          setCards(cardsData || []);
        })
        .catch((err) => {
          console.error('❌ Token inválido o error:', err);
          localStorage.removeItem('jwt');
          setLoggedIn(false);
          setUserEmail('');
          navigate('/signin');
        });
    }
  }, [navigate]);

  // REGISTRO
  const handleRegister = (email, password) => {
    auth.register(email, password)
      .then((res) => {
        setIsSuccess(true);
        setIsInfoTooltipOpen(true);
        navigate('/signin');
      })
      .catch((err) => {
        console.error('❌ Error en registro:', err);
        setIsSuccess(false);
        setIsInfoTooltipOpen(true);
      });
  };

  // LOGIN
  const handleLogin = (email, password) => {
    auth.login(email, password)
      .then((data) => {
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          setLoggedIn(true);
          setUserEmail(email);
          loadAppData();
          // Cargar datos del usuario
          return api.getUserInfo();
        }
      })
      .then((userData) => {
        if (userData) {
          setCurrentUser(userData);
          
          // Cargar cards
          return api.getInitialCards();
        }
      })
      .then((cardsData) => {
        setCards(cardsData || []);
        navigate('/');
      })
      .catch((err) => {
        console.error('❌ Error en login:', err);
        setIsSuccess(false);
        setIsInfoTooltipOpen(true);
        
        // Mostrar mensaje de error específico
        if (err.message && err.message.includes('401')) {
          alert('Email o contraseña incorrectos');
        }
      });
  };

  // LOGOUT
  const handleSignOut = () => {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
    setUserEmail('');
    setCurrentUser({
      name: '',
      about: '',
      avatar: '',
      _id: '',
      email: ''
    });
    setCards([]);
    navigate('/signin');
  };

  // Cargar datos cuando se inicia sesión
  const loadAppData = () => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, cardsData]) => {
        setCurrentUser(userData || {});
        setCards(cardsData || []);
      })
      .catch((err) => {
        console.error('❌ Error cargando datos:', err);
        setCurrentUser({
          name: 'Usuario',
          about: 'Descripción',
          avatar: '',
          _id: '',
          email: userEmail
        });
        setCards([]);
      });
  };

  // Helper para llamadas API
  const handleApiCall = (apiPromise, onSuccess) => {
    setIsLoading(true);
    apiPromise
      .then(onSuccess)
      .catch((err) => {
        console.error('❌ Error en API:', err);
        alert(err.message || 'Error en la operación');
      })
      .finally(() => setIsLoading(false));
  };

  // Funciones para cards
  function handleCardLike(card) {
  const isLiked = card.likes?.some(like => 
    like === currentUser._id || like._id === currentUser._id
  );
  
  const likeAction = isLiked ? api.dislikeCard(card._id) : api.likeCard(card._id);
  likeAction
    .then((updatedCard) => {
      setCards(prevCards => 
        prevCards.map(c => 
          c._id === card._id ? updatedCard : c
        )
      );
    })
    .catch((err) => {
      console.error("❌ Error actualizando like:", err);
      alert('Error al dar like');
    });
}
  const handleCardDelete = (card) => {
    handleApiCall(
      api.deleteCard(card._id),
      () => {
        setCards(state => state.filter(c => c._id !== card._id));
        closeAllPopups();
      }
    );
  };

  // Funciones para usuario
  const handleUpdateUser = (userData) => {
    handleApiCall(
      api.updateUserInfo(userData),
      (newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      }
    );
  };

  const handleUpdateAvatar = (avatarData) => {
    handleApiCall(
      api.updateAvatar(avatarData),
      (newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      }
    );
  };

  const handleAddPlaceSubmit = (cardData) => {
    handleApiCall(
      api.addCard(cardData),
      (newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      }
    );
  };

  // Funciones de popups
  const POPUP_CONFIG = {
    'edit-avatar': { title: 'Cambiar foto de perfil' },
    'edit-profile': { title: 'Editar perfil' },
    'add-place': { title: 'Nuevo lugar' },
    'image': { title: null },
    'remove-card': { title: '¿Estás seguro?' }
  };

  const openPopup = (type, card = null) => {
    if (type === 'image') setSelectedCard(card);
    if (type === 'remove-card') setCardToDelete(card);
    setPopup({ type, ...POPUP_CONFIG[type], card });
  };

  const handleEditAvatarClick = () => openPopup('edit-avatar');
  const handleEditProfileClick = () => openPopup('edit-profile');
  const handleAddPlaceClick = () => openPopup('add-place');
  const handleCardClick = (card) => openPopup('image', card);
  const handleDeleteClick = (card) => openPopup('remove-card', card);

  function closeAllPopups() {
    setPopup(null);
    setSelectedCard(null);
    setCardToDelete(null);
    setIsInfoTooltipOpen(false);
  }

  const renderPopupContent = () => {
    if (!popup) return null;
    const props = { isLoading, onClose: closeAllPopups };

    const components = {
      'edit-profile': <EditProfile {...props} onUpdateUser={handleUpdateUser} />,
      'add-place': <NewCard {...props} onAddCard={handleAddPlaceSubmit} />,
      'edit-avatar': <EditAvatar {...props} onUpdateAvatar={handleUpdateAvatar} />,
      'image': <ImagePopup card={popup.card} />,
      'remove-card': <RemoveCard {...props} onConfirm={() => handleCardDelete(popup.card)} onCancel={closeAllPopups} />
    };

    return components[popup.type] || null;
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header 
          email={userEmail} 
          onSignOut={handleSignOut}
          loggedIn={loggedIn}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <Main 
                  cards={cards}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleDeleteClick}
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/signin" 
            element={
              <ProtectedRoute anonymous={true} loggedIn={loggedIn}>
                <Login onLogin={handleLogin} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute anonymous={true} loggedIn={loggedIn}>
                <Register onRegister={handleRegister} />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to={loggedIn ? "/" : "/signin"} replace />} />
        </Routes>

        {loggedIn && <Footer />}

        {/* Popup único */}
        {popup && (
          <Popup 
            onClose={closeAllPopups} 
            title={popup.title}
          >
            {renderPopupContent()}
          </Popup>
        )}

        <InfoTooltip
          isOpen={isInfoTooltipOpen}
          onClose={closeAllPopups}
          isSuccess={isSuccess}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

