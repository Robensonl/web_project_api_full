# 🌎 Around the U.S. — Full-Stack Application

A full-stack photo-sharing application for discovering and sharing places across the United States. The project combines a **React + Vite** frontend with a **Node.js + Express + MongoDB** backend, with security controls built into the application and deployment layers.

🔗 **Repository:** [Robensonl/web_project_api_full](https://github.com/Robensonl/web_project_api_full)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Security Architecture & AppSec Implementation](#-security-architecture--appsec-implementation)
- [Vulnerability Assessment & Penetration Testing Results](#-vulnerability-assessment--penetration-testing-results)
- [Security Infrastructure Performance & Statistical Metrics](#-security-infrastructure-performance--statistical-metrics)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Screenshots](#-screenshots)
- [Author](#-author)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About the Project

Around the U.S. is an interactive photo-sharing platform where users can create accounts, share photos of places they love, and interact with other users' cards. The project demonstrates full-stack development practices including REST API design, authentication, input validation, testing, and deployment hardening.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and sign-in with JWT-based authentication (7-day token expiration)
- Password hashing with bcryptjs
- Authentication-protected routes and rate limiting on sensitive authentication endpoints
- HTTP security headers provided by Helmet.js
- CORS policy configured to allow trusted frontend origins

### 👤 User Management
- View and edit profile information and avatar
- Retrieve the current user's information and browse registered users

### 🃏 Card Management
- Create and browse place cards
- Like and unlike cards
- Delete cards owned by the authenticated user
- Cards sorted by creation date

### 🎨 Frontend
- Responsive mobile, tablet, and desktop layouts
- React hooks and Context API for application state
- Form validation, loading states, and error handling
- Animated popups

---

## 🔒 Security Architecture & AppSec Implementation

The application follows a **shift-left, defense-in-depth** approach: validate and constrain data at the API boundary, protect authentication flows, and apply security controls at the HTTP and deployment layers. These controls reduce risk; they do not, on their own, establish comprehensive or ongoing compliance with a security standard.

### 🛡️ Application Security
- **Input validation:** Request payloads are validated with **Celebrate/Joi** schemas before controller logic. This narrows accepted input and helps prevent malformed data and injection-style payloads from reaching application logic. Validation complements, but does not replace, safe database query construction, output encoding, and authorization checks.
- **OWASP-aligned risk reduction:** Validation, authentication, and ownership checks are used to address relevant risks such as injection, broken access control, and unsafe handling of user-supplied data. Coverage depends on the route and implementation; automated scan results should not be interpreted as proof that all OWASP Top 10 risks are eliminated.
- **Credential and token handling:** Passwords are stored as bcryptjs hashes, and stateless JWTs are used to authenticate protected API requests.
- **Authorization:** Protected routes require authentication; card deletion is restricted to the card owner.

### 🌐 HTTP & Infrastructure Hardening
- **Security headers:** **Helmet.js** applies HTTP response security headers. The configuration is intended to include controls such as `X-Content-Type-Options: nosniff`, clickjacking protection, and Content Security Policy where configured. Effective headers should be verified against the deployed response and the application's actual Helmet configuration.
- **Authentication rate limiting:** An `authLimiter` using `express-rate-limit` is applied to sensitive routes such as `/signin` and `/signup`. The audit figures below refer to the tested configuration with a `max: 5` threshold; effective limits also depend on the configured time window, key generation, and proxy/IP settings.
- **CORS:** A programmatic origin whitelist limits browser-based cross-origin access to configured trusted frontend origins. CORS is not an authentication mechanism and does not prevent non-browser clients from making requests.
- **Transport and reverse proxy:** The deployment uses Nginx as a reverse proxy with TLS certificates managed using Let's Encrypt/Certbot. Secure proxy configuration, certificate renewal, and forwarded-client-IP handling should be maintained and verified in deployment.

### 🔐 Request Flow

```text
Client
  │ HTTPS
  ▼
Nginx reverse proxy ── TLS termination / forwarded request
  │
  ▼
Express API ── Helmet headers / CORS policy
  │
  ├── Celebrate/Joi request validation
  ├── Authentication and authorization middleware
  ├── authLimiter on sensitive authentication routes
  ▼
Controllers ── Mongoose models ── MongoDB
```

---

## 🔬 Vulnerability Assessment & Penetration Testing Results

The following results summarize the reported tests performed in a **controlled Kali Linux lab** against the application. They represent the tested target, configuration, and test window—not a guarantee that the application is free of vulnerabilities.

### 1. Dynamic Application Security Testing — OWASP ZAP

| Test | Scope | Reported result |
|---|---|---|
| OWASP ZAP DAST | Backend REST API | **0 reported findings** across High, Medium, and Low severities (0 / 0 / 0) |

The scan was used to check the API for detectable issues under the test conditions. A clean scan is not proof of complete OWASP Top 10 coverage; authenticated routes, scan configuration, and manual verification affect coverage.

### 2. Authentication Rate-Limit Resiliency — THC-Hydra

| Test | Details |
|---|---|
| Target | `POST /signin` on the lab deployment |
| Tool | THC-Hydra v9.7 |
| Test configuration | Dictionary-based authentication test using `rockyou.txt`, with 16 parallel workers |
| Control evaluated | `authLimiter` configured with `max: 5` for the tested threshold |
| Observed behavior | The test reported requests being rejected after the configured limit, including HTTP `429 Too Many Requests` responses |

Run password-guessing tests only against systems you own or are explicitly authorized to assess. The Hydra run and its statistics are lab test results, not a production attack simulation.

---

## 📊 Security Infrastructure Performance & Statistical Metrics

The following confusion-matrix counts are the reported observations from the controlled Hydra test of the `authLimiter` configuration (`max: 5`). They describe this dataset and labeling method; they should not be generalized to all traffic or interpreted as a complete measure of production security.

### Confusion Matrix

| Classification | Count | Interpretation in this test |
|---|---:|---|
| True Positives (TP) | 11 | Test-labeled malicious requests blocked by the limiter, including HTTP 429 responses |
| False Positives (FP) | 0 | Test-labeled legitimate authentication requests blocked by the limiter |
| False Negatives (FN) | 5 | Test-labeled malicious requests not blocked by the limiter before the threshold was reached |
| True Negatives (TN) | 50 | Test-labeled normal baseline requests not blocked |

### 📐 Classification Metrics

**Precision** measures the proportion of requests blocked as malicious that were labeled malicious in this test:

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}} = \frac{11}{11 + 0} = 1.0 \; (100\%)$$

**Recall (completeness)** measures the proportion of test-labeled malicious requests that were blocked:

$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}} = \frac{11}{11 + 5} = \frac{11}{16} = 0.6875 \; (68.75\%)$$

These calculations assume the provided labels and counts are correct. In particular, zero observed false positives applies only to the 50-request baseline represented in this test; it does not establish a zero false-positive rate for all users or operating conditions.

### ⚖️ Threshold Trade-Off & Tuning

- **Higher threshold (`max: 50`):** The reported comparison test recorded 16 malicious requests not blocked under that configuration (FN: 16), corresponding to 0% recall for that sample if no malicious requests were blocked. A higher threshold can reduce friction for legitimate users but may allow more attack attempts before throttling.
- **Lower threshold (`max: 5`):** In the reported sample, 11 malicious requests were blocked and 5 were not, for 68.75% recall. A lower threshold can increase interception but may also increase legitimate-user friction if the limit or window is not tuned to actual traffic.
- **Operational tuning:** Select limits using measured legitimate and abusive traffic, use an appropriate limiter key and time window, account for trusted reverse-proxy configuration, and monitor `429` rates and user impact. Re-test after configuration changes.

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library and component model |
| **Vite 7** | Build tool and development server |
| **React Router DOM 7** | Client-side routing |
| **Context API** | Shared application state |
| **CSS3 + BEM** | Styling and naming convention |
| **LocalStorage** | Client-side JWT persistence |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework and REST API |
| **MongoDB** | Document database |
| **Mongoose 9** | MongoDB object modeling |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Celebrate/Joi** | Request validation |
| **Helmet.js** | HTTP security headers |
| **Winston** | Logging |
| **Jest + Supertest** | Automated testing |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| **PM2** | Node.js process management |
| **Nginx** | Reverse proxy and static file serving |
| **Certbot** | TLS certificate provisioning and renewal |
| **ESLint** | Code linting |

---

## 📁 Project Structure

```text
web_project_api_full/
├── backend/
│   ├── app.js                 # Express server entry point
│   ├── package.json
│   ├── .env                   # Local environment variables (not committed)
│   ├── controllers/           # User and card business logic
│   ├── models/                # User and card Mongoose schemas
│   ├── routes/                # User and card API routes
│   ├── middlewares/           # Authentication, validation, errors, logging
│   └── __tests__/             # Jest test suites
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── components/         # Pages and reusable UI components
│       ├── contexts/           # React Context providers
│       ├── utils/              # API and authentication utilities
│       └── blocks/             # BEM CSS files
└── README.md
```

---

## 🔌 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/signup` | Register a user |
| `POST` | `/signin` | Authenticate a user |

### Protected Routes (JWT required)

#### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Get all users |
| `GET` | `/users/me` | Get the current user |
| `GET` | `/users/:userId` | Get a user by ID |
| `PATCH` | `/users/me` | Update profile name and about text |
| `PATCH` | `/users/me/avatar` | Update avatar URL |

#### Cards

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cards` | Get all cards |
| `POST` | `/cards` | Create a card |
| `DELETE` | `/cards/:cardId` | Delete an owned card |
| `PUT` | `/cards/:cardId/likes` | Like a card |
| `DELETE` | `/cards/:cardId/likes` | Unlike a card |

### Example Requests

```bash
# Register
curl -X POST https://api.educben.mooo.com/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Sign in
curl -X POST https://api.educben.mooo.com/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Retrieve cards with a token
curl https://api.educben.mooo.com/cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16 or later
- MongoDB (local instance or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aroundb
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
EOF

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
cd backend
npm test
npm run test:coverage
```

---

## 🖼 Screenshots

Screenshots are maintained with the frontend project assets. Add or update the images here when publishing screenshots for the current application build.

---

## 👨‍💻 Author

### Robenson Louissaint

**Aspiring DevSecOps & Application Security Engineer | Full Stack Developer**

A developer advancing through a coding bootcamp and building modern web applications with a focus on clean code, automated testing, infrastructure metrics, and cloud security best practices.

- 💼 [LinkedIn](https://www.linkedin.com/in/robenson-louissaint/)
- 🐙 [GitHub](https://github.com/Robensonl)

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [TripleTen](https://tripleten.com/) — Bootcamp program
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
