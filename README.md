# 🌎 Around the U.S. — Full Stack Application

A full-stack web application for sharing and exploring photos of beautiful places across the United States. Built with **React + Vite** frontend and **Node.js + Express + MongoDB** backend.

🔗 **Live Demo:** [https://www.educben.mooo.com](https://www.educben.mooo.com)  
🔗 **API Endpoint:** [https://api.educben.mooo.com](https://api.educben.mooo.com)  
🔗 **GitHub Repo:** [https://github.com/Robensonl/web_project_api_full](https://github.com/Robensonl/web_project_api_full)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Zero-Trust Architecture](#️-zero-trust-architecture)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 🎯 About the Project

"Around the U.S." is an interactive photo-sharing platform where users can:
- Create an account and log in securely
- Share photos of their favorite places
- Like and unlike other users' photos
- Customize their profile information and avatar
- Delete their own cards

This project demonstrates a complete full-stack implementation with secure authentication, RESTful API design, and modern React patterns.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with email validation
- Secure login with JWT tokens (7-day expiration)
- Password hashing with bcrypt
- Protected routes requiring authentication
- Rate limiting to prevent brute force attacks
- Helmet.js for HTTP security headers
- CORS configuration for cross-origin requests

### 👤 User Management
- View and edit profile information
- Update profile avatar
- Get current user data
- View all registered users

### 🃏 Card Management
- Create new place cards with image and title
- View all cards from all users
- Like/unlike cards (toggle functionality)
- Delete your own cards
- Cards sorted by creation date

### 🎨 Frontend Features
- Responsive design (mobile, tablet, desktop)
- Modern React 19 with hooks
- Context API for global state management
- Form validation with visual feedback
- Loading states and error handling
- Smooth popup animations

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with hooks |
| **Vite 7** | Build tool and dev server |
| **React Router DOM 7** | Client-side routing |
| **Context API** | Global state management |
| **CSS3 + BEM** | Styling methodology |
| **LocalStorage** | JWT token persistence |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose 9** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Celebrate/Joi** | Request validation |
| **Helmet** | Security headers |
| **Winston** | Logging |
| **Jest + Supertest** | Testing |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **PM2** | Process manager |
| **Nginx** | Reverse proxy & static files |
| **Certbot** | SSL certificates |
| **ESLint** | Code linting |

---

## 📁 Project Structure

```
web_project_api_full/
├── backend/
│   ├── app.js                 # Express server entry point
│   ├── package.json
│   ├── .env                   # Environment variables (not in repo)
│   ├── controllers/
│   │   ├── users.js           # User business logic
│   │   └── cards.js           # Card business logic
│   ├── models/
│   │   ├── user.js            # User Mongoose schema
│   │   └── card.js            # Card Mongoose schema
│   ├── routes/
│   │   ├── users.js           # User routes
│   │   └── cards.js           # Card routes
│   ├── middlewares/
│   │   ├── auth.js            # JWT authentication
│   │   ├── validation.js      # Request validation schemas
│   │   ├── errorHandler.js    # Centralized error handling
│   │   └── logger.js          # Request/error logging
│   └── __tests__/             # Jest test suites
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── index.css          # Global styles
│       ├── components/        # React components
│       │   ├── App.jsx
│       │   ├── Main.jsx
│       │   ├── Header/
│       │   ├── Footer/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── ProtectedRoute/
│       │   └── Main/
│       │       └── components/
│       │           ├── Card/
│       │           └── Popup/
│       ├── contexts/          # React Context
│       ├── utils/             # API & auth utilities
│       └── blocks/            # BEM CSS files
│
└── README.md
```

---

## 🔌 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/signin` | Login user |

### Protected Routes (require JWT)

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `GET` | `/users/me` | Get current user |
| `GET` | `/users/:userId` | Get user by ID |
| `PATCH` | `/users/me` | Update profile (name, about) |
| `PATCH` | `/users/me/avatar` | Update avatar URL |

#### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cards` | Get all cards |
| `POST` | `/cards` | Create new card |
| `DELETE` | `/cards/:cardId` | Delete card (owner only) |
| `PUT` | `/cards/:cardId/likes` | Like a card |
| `DELETE` | `/cards/:cardId/likes` | Unlike a card |

### Example Requests

```bash
# Register
curl -X POST https://api.educben.mooo.com/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST https://api.educben.mooo.com/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get cards (with token)
curl https://api.educben.mooo.com/cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aroundb
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
EOF

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm run test:coverage
```

---

## 🛡️ Zero-Trust Architecture

This project is built with a Zero-Trust security mindset, aligned with **NIST SP 800-207**, **Google BeyondCorp**, and **Microsoft Zero-Trust** standards.

Key security controls already in place:

| Pillar | Control | Status |
|--------|---------|--------|
| 🪪 Identity | JWT authentication (every request) | ✅ |
| 🪪 Identity | bcrypt password hashing | ✅ |
| 🌐 Network | Strict CORS by origin | ✅ |
| 🌐 Network | Rate limiting on auth endpoints | ✅ |
| 🌐 Network | HTTP security headers (Helmet) | ✅ |
| 📦 Applications | Input validation (Celebrate/Joi) | ✅ |
| 🗄️ Data | Password masked from API responses | ✅ |
| 🗄️ Data | HTTPS via Nginx + Certbot | ✅ |
| 📊 Logs | Structured request/error logs (Winston) | ✅ |

📄 **Full architecture documentation:** [docs/ZERO_TRUST_ARCHITECTURE.md](docs/ZERO_TRUST_ARCHITECTURE.md)

The documentation covers the complete SentinelGate Zero-Trust architecture with all 6 pillars (Identity, Devices, Network, Applications, Data, Logs & Telemetry), implementation details, and a roadmap for future enhancements.

---

## 🖼 Screenshots

| Register | Login | Home Page |
|:---:|:---:|:---:|
| ![Register](https://raw.githubusercontent.com/Robensonl/web_project_around_auth/main/src/assets/SIGN_UP.png) | ![Login](https://raw.githubusercontent.com/Robensonl/web_project_around_auth/main/src/assets/DesktopSUCCESS.png) | ![Home](https://raw.githubusercontent.com/Robensonl/web_project_around_auth/main/src/assets/Home_page.jpg) |

| Edit Profile | Add New Place | View Card |
|:---:|:---:|:---:|
| ![Edit Profile](https://github.com/Robensonl/web_project_around_react/raw/main/src/assets/screenshot-edit-profile.jpg) | ![Add Place](https://github.com/Robensonl/web_project_around_react/raw/main/src/assets/screenshot-add-place.jpg) | ![View Card](https://github.com/Robensonl/web_project_around_react/raw/main/src/assets/screenshot-emerge-image.jpg) |

---

## 👨‍💻 Author

### Robenson Louissaint

**Full Stack Developer** | Student | Cybersecurity Enthusiast

I'm a passionate developer advancing through a coding bootcamp, building modern web applications with a focus on clean code and security best practices.

- 💼 [LinkedIn](https://www.linkedin.com/in/robenson-louissaint/)
- 🐙 [GitHub](https://github.com/Robensonl)
- 🌐 [Live Project](https://www.educben.mooo.com)

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [TripleTen](https://tripleten.com/) - Bootcamp program
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
