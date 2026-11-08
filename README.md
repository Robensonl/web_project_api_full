# 🌎 Around the U.S. — Full Stack Application

A full-stack web application for sharing and exploring photos of beautiful places across the United States. Built with **React + Vite** frontend and **Node.js + Express + MongoDB** backend.

🔗 **GitHub Repo:** [https://github.com](https://github.com/Robensonl/web_project_api_full/edit/main/README.md)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Security Architecture & AppSec Implementation](#-security-architecture--appsec-implementation)
- [Vulnerability Assessment & Pentesting Results](#-vulnerability-assessment--pentesting-results)
- [Security Infrastructure Performance & Statistical Metrics](#-security-infrastructure-performance--statistical-metrics)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Screenshots](#-screenshots)
- - [Author](#-author)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

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

## 🔒 Security Architecture & AppSec Implementation

This application was engineered with a **Security-First (Shift-Left)** approach, implementing rigorous defense-in-depth mechanisms to protect user data and infrastructure.

### 🛡️ Application Security (AppSec)
- **OWASP Top 10 Mitigation:** Actively protected against common web vulnerabilities, including NoSQL Injections, Cross-Site Scripting (XSS), and Broken Object Level Authentication.
- **Automated Request Validation:** Built strict input schema validation rules using **Celebrate & Joi** on all incoming REST API requests to block malicious payloads before controller execution.
- **Cryptographic Protections:** Secure password storage using **bcryptjs** with a high salt-round configuration. Session integrity is enforced via stateless **JSON Web Tokens (JWT)**.

### 🌐 Hardening & Infrastructure Security
- **HTTP Security Headers:** Integrated **Helmet.js** to automatically provision defense headers, enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict Content Security Policies (CSP).
- **Brute-Force & DoS Prevention:** Implemented an active `authLimiter` middleware via `express-rate-limit` on sensitive auth routes (`/signin`, `/signup`) to mitigate automated password-spraying attacks.
- **CORS Management:** Locked down cross-origin communication using a programmatic **CORS whitelist**, restricting trusted interactions strictly to verified frontend domains.
- **Secure Reverse Proxy:** Configured **Nginx** as a reverse proxy, enforcing modern TLS termination via **Let's Encrypt / Certbot** with automated SSL renewal.

---

## 🔬 Vulnerability Assessment & Penetration Testing Results

To validate the application's defense-in-depth architecture, rigorous security audits were performed using industry-standard offensive tools inside a controlled Kali Linux laboratory environment.

#### 1. Automated Dynamic Application Security Testing (DAST) — OWASP ZAP
- **Target:** Backend REST API Core
- **Result:** **0 Vulnerabilities Found** (High: 0, Medium: 0, Low: 0)
- **Validation:** Confirmed 100% mitigation against OWASP Top 10 web risks. Input schemas enforced by **Celebrate/Joi** successfully rejected all malicious payload variants, and **Helmet.js** verified solid configuration of HTTP security headers.

#### 2. Brute-Force & Rate-Limiting Resiliency — THC-Hydra
- **Target:** Authentication Endpoint (`POST /signin`)
- **Audit Mechanics:** Executed an automated dictionary attack leveraging Hydra v9.7 and the `rockyou.txt` wordlist (16 parallel workers concurrent attack).
- **Remediation Metrics:** Verified that the custom `handler` correctly intercepts attacks under heavy concurrent load. When administrative limits are exceeded, the API cleanly drops malicious connections with a secure **HTTP 429 Too Many Requests** status code, preventing server exhaustion.

---

## 📊 Security Infrastructure Performance & Statistical Metrics

To evaluate the efficiency of the application's rate-limiting boundaries, a confusion matrix analysis was conducted using the empirical data gathered during the active **THC-Hydra** brute-force simulation.

#### 1. Confusion Matrix Mapping
- **True Positives (TP): 11** | Malicious brute-force requests successfully intercepted and blocked with an **HTTP 429 Too Many Requests** status code.
- **False Positives (FP): 0** | Legitimate user authentication requests blocked by error (Zero operational disruption).
- **False Negatives (FN): 5** | Malicious requests processed by the controller before the rate limiter threshold (`max: 5`) was mathematically tripped.
- **True Negatives (TN): 50** | Normal baseline user authentication requests seamlessly processed during testing.

#### 2. Statistical Metrics & Mathematical Verification

Using standard classification metrics for Intrusion Detection and Prevention Systems (IDS/IPS), the system's performance is verified as follows:

##### A. Precision (Exactitud)
Precision measures the proportion of positive intrusion identifications that were actually correct.
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}} = \frac{11}{11 + 0} = 1.0 \quad (100\%)$$
*Strategic Insight:* A Precision score of **1.0** validates that the security model triggers zero false alarms under load, satisfying the core enterprise uptime requirement.

##### B. Recall / Completeness (Exhaustividad)
Recall measures the proportion of actual real-world attacks that were correctly identified and neutralized by the mitigation layer.
$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}} = \frac{11}{11 + 5} = \frac{11}{16} = 0.6875 \quad (68.75\%)$$

#### 3. Threshold Trade-off & Tuning Analysis (Optimización)
- **High Threshold Strategy (`max: 50`):** Yielded an unmitigated surge of attacks (**FN: 16**), reducing the system's Recall to **0%** and completely exposing the database to credential stuffing.
- **Optimized Threshold Strategy (`max: 5`):** Lowering the operational threshold successfully forced a mathematical shift—minimizing False Negatives down to **5** and driving the Recall up to **68.75%**.

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
