# 🛡️ Architecture Backend Zero-Trust — SentinelGate

> **Projet IPP — Pratique Professionnelle (450 heures)**  
> Instituto Profesional Provincial (IPP)  
> Auteur : Robenson Louissaint  
> Standards : NIST SP 800-207 · Google BeyondCorp · Microsoft Zero-Trust  

---

## 📋 Table des matières

1. [Vision générale](#1-vision-générale)
2. [Les 6 piliers Zero-Trust](#2-les-6-piliers-zero-trust)
3. [Module IAM — Identity & Access Management](#3-module-iam--identity--access-management)
4. [Module API Gateway Zero-Trust](#4-module-api-gateway-zero-trust)
5. [Module Microservices Backend](#5-module-microservices-backend)
6. [Module Data Security Layer](#6-module-data-security-layer)
7. [Module Device Trust](#7-module-device-trust)
8. [Module Network Micro-Segmentation](#8-module-network-micro-segmentation)
9. [Module Observabilité & Sécurité](#9-module-observabilité--sécurité)
10. [Schéma logique de l'architecture](#10-schéma-logique-de-larchitecture)
11. [Mapping vers le projet existant](#11-mapping-vers-le-projet-existant)
12. [Références](#12-références)

---

## 1. Vision générale

SentinelGate repose sur un backend **segmenté, vérifiable et contrôlé en continu**.  
Chaque requête, chaque identité, chaque ressource doit être **authentifiée, autorisée, journalisée et validée** avant d'être exécutée.

Le modèle Zero-Trust remplace le paradigme périmétrique classique (« faire confiance au réseau interne ») par le principe :

> **"Ne jamais faire confiance, toujours vérifier."**  
> — NIST SP 800-207

Cette architecture est alignée avec :

| Standard | Organisation | Principe clé |
|----------|-------------|--------------|
| NIST SP 800-207 | NIST | Zero-Trust Architecture |
| BeyondCorp | Google | Accès basé sur l'identité, pas le réseau |
| Zero-Trust Framework | Microsoft | Vérification explicite à chaque couche |

---

## 2. Les 6 piliers Zero-Trust

```
┌─────────────────────────────────────────────────────────────────┐
│                    6 PILIERS ZERO-TRUST                         │
│                                                                 │
│  1. 🪪 Identité       IAM, MFA, RBAC, ABAC                     │
│  2. 💻 Appareils      Device Posture, Device Trust              │
│  3. 🌐 Réseau         Micro-segmentation, API Gateway           │
│  4. 📦 Applications   Services isolés, Zero-Trust per service   │
│  5. 🗄️  Données        Classification, chiffrement, masquage    │
│  6. 📊 Logs           SIEM, audit, forensic, alerting           │
└─────────────────────────────────────────────────────────────────┘
```

### Pilier 1 — Identité
Chaque entité (utilisateur, service, appareil) doit prouver son identité à chaque requête.
- Authentification forte (MFA, TOTP, WebAuthn)
- Jetons de courte durée (JWT + refresh)
- RBAC/ABAC dynamique

### Pilier 2 — Appareils
Un appareil non conforme ne peut pas accéder aux ressources, même avec des identifiants valides.
- Vérification OS, antivirus, Device ID
- Score de risque calculé dynamiquement

### Pilier 3 — Réseau
Le réseau interne n'est pas considéré comme fiable.
- Micro-segmentation en zones
- mTLS entre services
- API Gateway comme unique point d'entrée

### Pilier 4 — Applications
Chaque service applicatif est isolé et applique ses propres contrôles.
- Communication via mTLS ou message broker sécurisé
- Autorisation par service (pas uniquement à la frontière)

### Pilier 5 — Données
Les données sont classifiées et protégées à chaque niveau.
- Chiffrement au repos (AES-256)
- Chiffrement en transit (TLS 1.3)
- Masquage selon le rôle de l'utilisateur

### Pilier 6 — Logs & Telemetry
Chaque événement est journalisé, immuable et analysé en temps réel.
- SIEM centralisé
- Alertes en temps réel
- Logs forensiques immuables

---

## 3. Module IAM — Identity & Access Management

C'est le **cœur du Zero-Trust**. Toute requête doit passer par une vérification d'identité.

### 3.1 Composants

| Composant | Rôle |
|-----------|------|
| Service d'authentification | OAuth2 / OIDC, émission de JWT |
| MFA | TOTP (Google Authenticator), WebAuthn (FIDO2) |
| RBAC | Contrôle d'accès basé sur les rôles (admin, user, viewer) |
| ABAC | Attributs dynamiques : localisation, device, heure, score de risque |
| Gestion des sessions | Tokens courts (15 min) + refresh tokens (7 jours) |
| Revocation Service | Liste noire de tokens (Redis/DB) |

### 3.2 Flux d'authentification Zero-Trust

```
Client
  │
  ├─► [1] POST /signin  {email, password}
  │         │
  │         ▼
  │   [Validation Joi/Celebrate]
  │         │
  │         ▼
  │   [bcryptjs — vérification hash]
  │         │
  │         ▼
  │   [JWT signé — HS256 — 7 jours (token d'accès actuel)]
  │   ⚠️  Zero-Trust recommande : accès court (15 min) + refresh token (7 jours)
  │         │
  ◄─── [2] {token: "eyJ..."}
  │
  ├─► [3] GET /cards  Authorization: Bearer eyJ...
  │         │
  │         ▼
  │   [Middleware auth.js]
  │   - Vérifier header Authorization
  │   - Valider signature JWT (JWT_SECRET)
  │   - Vérifier expiration (TokenExpiredError)
  │   - Extraire payload {_id, iat, exp}
  │         │
  │         ▼
  │   [req.user = payload]  →  Routeur protégé
  │
  └─► [4] PATCH /users/me  → Contrôle propriétaire
```

### 3.3 Implémentation actuelle (`backend/middlewares/auth.js`)

```javascript
// Vérification du token à chaque requête protégée
const payload = jwt.verify(token, process.env.JWT_SECRET);
// → TokenExpiredError : token expiré
// → JsonWebTokenError : signature invalide
req.user = payload;  // Injection de l'identité dans la requête
```

### 3.4 Améliorations Zero-Trust recommandées

- [ ] Rotation automatique des clés JWT (RS256 avec clé privée/publique)
- [ ] Intégration MFA (TOTP via `speakeasy` ou `otplib`)
- [ ] Revocation service (blacklist Redis avec TTL)
- [ ] ABAC : vérifier IP, User-Agent, heure, géolocalisation
- [ ] Refresh token rotatif (renouvellement à chaque utilisation)

---

## 4. Module API Gateway Zero-Trust

Point d'entrée **unique et sécurisé** du backend. Aucun service interne n'est accessible directement.

### 4.1 Rôles

| Fonction | Description |
|----------|-------------|
| Termination TLS | HTTPS obligatoire (TLS 1.2 minimum, TLS 1.3 recommandé) |
| Validation des tokens | Vérification JWT avant tout routage |
| Politiques d'accès | Application RBAC/ABAC |
| Rate limiting | Protection anti-brute force, anti-DDoS |
| WAF intégré | Détection de patterns suspects (injections, XSS) |
| Routage | Vers les microservices internes uniquement |

### 4.2 Implémentation actuelle (`backend/app.js`)

```javascript
app.use(helmet());           // Headers HTTP sécurisés
app.use(cors(corsOptions));  // CORS strict (origine contrôlée)
app.use(express.json({ limit: '10kb' })); // Limite de taille
app.use(requestLogger);      // Journalisation

// Rate limiting sur /signup et /signin
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                    // 50 tentatives max
});

app.use(auth);               // Middleware Zero-Trust : vérification JWT
```

### 4.3 Technologies d'API Gateway

Pour une architecture de production :

| Technologie | Usage |
|-------------|-------|
| **Nginx** | Reverse proxy, terminaison TLS, rate limiting |
| **Kong Gateway** | API Gateway complet avec plugins Zero-Trust |
| **Traefik** | Reverse proxy cloud-native avec middleware |
| **AWS API Gateway** | Solution cloud managée |

### 4.4 Configuration Nginx (exemple)

```nginx
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rate limiting
    limit_req zone=auth burst=10 nodelay;

    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 5. Module Microservices Backend

Chaque service est **isolé**, avec son propre rôle et ses propres contrôles d'accès.

### 5.1 Services recommandés

| Service | Responsabilités |
|---------|----------------|
| **User-Service** | Profils, rôles, permissions, gestion des comptes |
| **Device-Service** | Posture device, conformité, empreinte, Device ID |
| **Policy-Service** | Règles Zero-Trust dynamiques, politiques ABAC |
| **Audit-Service** | Logs, événements, anomalies, forensic |
| **Data-Service** | Accès aux données classifiées, contrôle d'accès fin |
| **Notification-Service** | Alertes, emails, SMS, webhooks |
| **Threat-Service** | Détection d'intrusion, scoring de risque, blocage |

### 5.2 Architecture actuelle (monolithique modulaire)

L'architecture actuelle utilise un design **monolithique modulaire**, étape intermédiaire vers les microservices :

```
backend/
├── controllers/
│   ├── users.js     → logique User-Service
│   └── cards.js     → logique Data-Service (cartes)
├── models/
│   ├── user.js      → schéma utilisateur (Mongoose)
│   └── card.js      → schéma carte (Mongoose)
├── routes/
│   ├── users.js     → routes User-Service
│   └── cards.js     → routes Data-Service
└── middlewares/
    ├── auth.js       → IAM (vérification JWT)
    ├── validation.js → validation des entrées
    ├── errorHandler.js → gestion centralisée des erreurs
    └── logger.js     → Audit-Service (Winston)
```

### 5.3 Communication inter-services

| Mode | Technologie | Usage |
|------|-------------|-------|
| Synchrone | REST/HTTP + mTLS | Requêtes temps réel |
| Asynchrone | Kafka / RabbitMQ | Événements, notifications |
| Service Mesh | Istio / Linkerd | mTLS automatique entre services |

### 5.4 Améliorations vers microservices

- [ ] Extraire `User-Service` en service Node.js indépendant
- [ ] Créer `Audit-Service` dédié avec stockage immuable
- [ ] Implémenter `Policy-Service` pour les règles ABAC dynamiques
- [ ] Ajouter `Threat-Service` avec scoring de risque
- [ ] Configurer mTLS entre services (certificats mutuels)

---

## 6. Module Data Security Layer

Protection des données sensibles à chaque niveau.

### 6.1 Niveaux de classification

| Niveau | Description | Exemple |
|--------|-------------|---------|
| 🟢 Public | Données accessibles sans restriction | Noms de lieux publics |
| 🟡 Interne | Données accessibles aux utilisateurs authentifiés | Profils utilisateurs |
| 🟠 Sensible | Données à accès restreint | Données personnelles, emails |
| 🔴 Critique | Données hautement confidentielles | Mots de passe, tokens, secrets |

### 6.2 Protection implémentée

```javascript
// Hachage des mots de passe (bcryptjs — coût 12, conforme Zero-Trust)
const hash = await bcrypt.hash(password, 12);

// Masquage du mot de passe dans les réponses API
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // ← mot de passe jamais exposé
  return user;
};
```

### 6.3 Chiffrement recommandé

| Type | Standard | Implémentation |
|------|----------|----------------|
| Repos | AES-256-GCM | MongoDB Encrypted Storage Engine |
| Transit | TLS 1.3 | Nginx / Certbot |
| Mots de passe | bcrypt (coût ≥ 12) | bcryptjs |
| Tokens | HMAC-SHA256 / RS256 | jsonwebtoken |
| Secrets | Vault / AWS Secrets Manager | HashiCorp Vault |

### 6.4 Masquage dynamique par rôle

```javascript
// Exemple : masquer l'email selon le rôle
const sanitizeUser = (user, requesterRole) => {
  const data = user.toJSON();
  if (requesterRole !== 'admin') {
    delete data.email; // email visible seulement pour admin
  }
  return data;
};
```

### 6.5 Améliorations recommandées

- [ ] Activer MongoDB Encrypted Storage Engine (AES-256)
- [ ] Tokenisation des données PII (pseudonymisation)
- [ ] Masquage dynamique selon le rôle de l'utilisateur
- [ ] Journaliser chaque accès aux données sensibles
- [ ] Implémenter une politique de rétention des données

---

## 7. Module Device Trust

Chaque requête doit inclure des informations sur l'appareil de l'utilisateur. Un appareil non conforme se voit refuser l'accès, même avec un token valide.

### 7.1 Vérifications Device Trust

| Vérification | Description | Score de risque |
|--------------|-------------|-----------------|
| OS à jour | Version OS >= seuil minimum | +0 (conforme) / +30 (non conforme) |
| Antivirus actif | Détection d'un agent de sécurité | +0 / +25 |
| Device ID enregistré | Appareil connu et approuvé | +0 / +40 |
| Géolocalisation | Cohérence avec l'historique de connexion | +0 / +20 |
| User-Agent | Navigateur/OS reconnu | +0 / +15 |

### 7.2 Flux Device Posture

```
Requête client
     │
     ▼
[Extraction Device Info]
- User-Agent
- IP géolocalisée
- Device-ID (cookie sécurisé ou header)
     │
     ▼
[Calcul Score de Risque]
- score = 0..100
- 0-30 : faible risque → accès autorisé
- 31-60 : risque moyen → MFA requis
- 61-100 : risque élevé → accès bloqué
     │
     ▼
[Décision d'accès]
```

### 7.3 Implémentation recommandée

```javascript
// Middleware Device Trust
const deviceTrust = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;

  const riskScore = calculateRiskScore({ deviceId, userAgent, ip });

  if (riskScore > 60) {
    return res.status(403).json({
      message: 'Accès refusé : appareil non conforme',
      riskScore,
    });
  }

  req.deviceRisk = riskScore;
  next();
};
```

---

## 8. Module Network Micro-Segmentation

Le réseau backend est divisé en **zones de confiance strictes**. Chaque zone est isolée et ne communique qu'avec les zones autorisées.

### 8.1 Zones de sécurité réseau

| Zone | Composants | Accès entrant | Accès sortant |
|------|-----------|---------------|---------------|
| **Public Edge** | API Gateway (Nginx), Load Balancer | Internet (HTTPS 443) | Service Mesh |
| **Service Mesh** | User-Service, Card-Service, Audit-Service | API Gateway uniquement | Data Vault, Security Core |
| **Data Vault** | MongoDB, Redis, Secrets Manager | Service Mesh (mTLS) | Service Mesh (résultats) |
| **Security Core** | IAM, SIEM, IDS/IPS, Policy Engine | Service Mesh | Service Mesh, Alerting |

### 8.2 Règles de segmentation

```
Internet
    │
    ▼ HTTPS/443
┌─────────────────┐
│   Public Edge   │  ← Seule zone exposée à Internet
│   (Nginx/Kong)  │
└────────┬────────┘
         │ HTTP/mTLS (réseau interne)
         ▼
┌─────────────────┐
│  Service Mesh   │  ← Services isolés, pas d'accès direct
│  User-Service   │
│  Card-Service   │
│  Audit-Service  │
└────────┬────────┘
         │ mTLS
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│  Data   │ │  Security    │
│  Vault  │ │  Core        │
│  MongoDB│ │  IAM / SIEM  │
└─────────┘ └──────────────┘
```

### 8.3 Configuration Docker Compose (exemple)

```yaml
networks:
  public-edge:
    driver: bridge
  service-mesh:
    driver: bridge
    internal: true    # Pas d'accès Internet
  data-vault:
    driver: bridge
    internal: true
  security-core:
    driver: bridge
    internal: true

services:
  nginx:
    networks: [public-edge, service-mesh]

  backend:
    networks: [service-mesh, data-vault]

  mongodb:
    networks: [data-vault]

  redis:
    networks: [data-vault, security-core]
```

### 8.4 mTLS entre services

```yaml
# Exemple Istio — mTLS automatique dans le Service Mesh
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: sentinelgate
spec:
  mtls:
    mode: STRICT  # mTLS obligatoire entre tous les services
```

---

## 9. Module Observabilité & Sécurité

SentinelGate doit **tout journaliser**. Chaque événement de sécurité est capturé, analysé et archivé.

### 9.1 Stack d'observabilité

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **SIEM** | Elastic Stack (ELK), Splunk, Wazuh | Centralisation et analyse des logs |
| **IDS/IPS** | Suricata, Snort | Détection/prévention d'intrusion réseau |
| **Monitoring** | Prometheus + Grafana | Métriques temps réel, dashboards |
| **Alerting** | Webhook, Slack, Email | Notifications d'incidents |
| **Logs forensiques** | Append-only logs, S3/Glacier | Logs immuables pour investigations |

### 9.2 Événements suivis

| Catégorie | Événements journalisés |
|-----------|----------------------|
| 🔐 Authentification | Login, logout, échec d'auth, MFA, token révoqué |
| 👤 Accès utilisateur | Création, modification, suppression de compte |
| 🗄️ Accès données | Lecture/écriture de données sensibles |
| 🌐 API | Chaque appel API (méthode, route, statut, latence) |
| ⚠️ Anomalies | Rate limit atteint, IP suspecte, User-Agent anormal |
| 🚨 Intrusion | Injection SQL/NoSQL, XSS, CSRF, scan de ports |
| ⚙️ Configuration | Modifications de politiques, changements de rôles |

### 9.3 Implémentation actuelle (`backend/middlewares/logger.js`)

```javascript
// Winston — journalisation structurée JSON
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' })
  ],
  format: logFormat,
  meta: true,
  expressFormat: true,
});

const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ],
});
```

### 9.4 Format de log Zero-Trust recommandé

```json
{
  "timestamp": "2025-01-15T14:32:01.234Z",
  "level": "info",
  "event": "auth.login.success",
  "userId": "507f1f77bcf86cd799439011",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0 ...",
  "deviceId": "dev-abc123",
  "riskScore": 12,
  "requestId": "req-uuid-v4",
  "duration": 145
}
```

### 9.5 Améliorations recommandées

- [ ] Envoyer les logs vers un SIEM centralisé (Elastic Stack)
- [ ] Configurer des alertes Prometheus pour les anomalies
- [ ] Implémenter des logs immuables (append-only, hash de chaîne)
- [ ] Créer un dashboard Grafana pour les métriques de sécurité
- [ ] Intégrer Wazuh pour la détection d'intrusion

---

## 10. Schéma logique de l'architecture

```
╔═══════════════════════════════════════════════════════════════╗
║                        CLIENT                                 ║
║           Browser / Mobile App / API Consumer                 ║
╚═══════════════════════╤═══════════════════════════════════════╝
                        │
                  TLS + MFA + Device Posture
                        │
                        ▼
╔═══════════════════════════════════════════════════════════════╗
║              API GATEWAY ZERO-TRUST                           ║
║   Nginx / Kong    │   Rate Limit │ WAF │ CORS │ JWT Verify    ║
║                   │   RBAC/ABAC  │ TLS │ Logs │ Routing       ║
╚═══════════════════╤═══════════════════════════════════════════╝
                    │
              RBAC/ABAC + WAF
                    │
                    ▼
╔═══════════════════════════════════════════════════════════════╗
║                    SERVICE MESH                               ║
║                 (mTLS entre services)                         ║
║                                                               ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ║
║  │ User-Service│  │Device-Service│  │  Policy-Service     │  ║
║  │ (profils,   │  │(posture,     │  │  (règles ABAC,      │  ║
║  │  rôles)     │  │ conformité)  │  │   dynamiques)       │  ║
║  └─────────────┘  └─────────────┘  └─────────────────────┘  ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ║
║  │Threat-Service│  │Audit-Service│  │    Data-Service     │  ║
║  │(détection,  │  │(logs,       │  │  (accès données     │  ║
║  │ scoring)    │  │ forensic)   │  │   classifiées)      │  ║
║  └─────────────┘  └─────────────┘  └──────────┬──────────┘  ║
╚══════════════════════════════════════════════════╪════════════╝
                                                   │ mTLS + AES-256
                                                   ▼
╔══════════════════════════════════════════════════════════════╗
║                      DATA VAULT                              ║
║                                                              ║
║  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ ║
║  │  DB chiffrée  │  │ Secrets Manager│  │  Tokenization  │ ║
║  │  (MongoDB     │  │ (HashiCorp     │  │  Engine        │ ║
║  │   AES-256)    │  │  Vault)        │  │  (PII protect) │ ║
║  └───────────────┘  └────────────────┘  └────────────────┘ ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                    SECURITY CORE                             ║
║                                                              ║
║  ┌───────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐ ║
║  │  IAM  │  │    SIEM    │  │  IDS/IPS │  │  Monitoring │ ║
║  │(JWT,  │  │(Elastic/   │  │(Suricata,│  │(Prometheus/ │ ║
║  │ MFA,  │  │ Wazuh)     │  │ Snort)   │  │  Grafana)   │ ║
║  │ RBAC) │  │            │  │          │  │             │ ║
║  └───────┘  └────────────┘  └──────────┘  └─────────────┘ ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 11. Mapping vers le projet existant

Le projet **"Around the U.S."** implémente déjà plusieurs contrôles Zero-Trust. Voici le mapping entre l'architecture SentinelGate et le code existant :

### 11.1 Contrôles Zero-Trust déjà en place

| Pilier | Contrôle | Fichier | Statut |
|--------|----------|---------|--------|
| 🪪 Identité | Authentification JWT | `middlewares/auth.js` | ✅ Implémenté |
| 🪪 Identité | Hachage bcrypt (coût 10) | `controllers/users.js` | ✅ Implémenté |
| 🪪 Identité | Validation email/password (Joi) | `middlewares/validation.js` | ✅ Implémenté |
| 🌐 Réseau | CORS strict par origine | `app.js` | ✅ Implémenté |
| 🌐 Réseau | Rate limiting auth (50/15min) | `app.js` | ✅ Implémenté |
| 🌐 Réseau | Headers sécurisés (Helmet) | `app.js` | ✅ Implémenté |
| 🌐 Réseau | Limite payload (10kb) | `app.js` | ✅ Implémenté |
| 📦 Applications | Routes protégées par middleware | `app.js` | ✅ Implémenté |
| 📦 Applications | Validation ObjectId | `middlewares/validation.js` | ✅ Implémenté |
| 🗄️ Données | Masquage mot de passe (JSON) | `models/user.js` | ✅ Implémenté |
| 🗄️ Données | HTTPS via Nginx + Certbot | Infrastructure | ✅ Déployé |
| 📊 Logs | Logs requêtes (Winston) | `middlewares/logger.js` | ✅ Implémenté |
| 📊 Logs | Logs erreurs (Winston) | `middlewares/logger.js` | ✅ Implémenté |

### 11.2 Améliorations Zero-Trust à implémenter

| Pilier | Amélioration | Priorité | Complexité |
|--------|-------------|----------|------------|
| 🪪 Identité | MFA (TOTP/WebAuthn) | 🔴 Haute | ⚙️⚙️⚙️ |
| 🪪 Identité | Rotation clés JWT (RS256) | 🟠 Moyenne | ⚙️⚙️ |
| 🪪 Identité | Token revocation (Redis) | 🟠 Moyenne | ⚙️⚙️ |
| 💻 Appareils | Device Trust middleware | 🟡 Faible | ⚙️⚙️⚙️ |
| 💻 Appareils | Device ID + scoring risque | 🟡 Faible | ⚙️⚙️⚙️ |
| 🌐 Réseau | Micro-segmentation Docker | 🟠 Moyenne | ⚙️⚙️ |
| 🌐 Réseau | mTLS inter-services | 🔴 Haute | ⚙️⚙️⚙️ |
| 📦 Applications | RBAC granulaire (rôles multiples) | 🟠 Moyenne | ⚙️⚙️ |
| 📦 Applications | ABAC (attributs dynamiques) | 🔴 Haute | ⚙️⚙️⚙️ |
| 🗄️ Données | Chiffrement MongoDB (AES-256) | 🟠 Moyenne | ⚙️⚙️ |
| 🗄️ Données | Tokenisation PII | 🔴 Haute | ⚙️⚙️⚙️ |
| 📊 Logs | SIEM centralisé (Elastic) | 🟠 Moyenne | ⚙️⚙️ |
| 📊 Logs | Alertes temps réel | 🟠 Moyenne | ⚙️⚙️ |
| 📊 Logs | Logs immuables (forensic) | 🟡 Faible | ⚙️⚙️ |

### 11.3 Roadmap d'implémentation

```
Phase 1 — Fondations Zero-Trust (1-2 semaines)
├── Rotation clés JWT vers RS256
├── Token revocation avec Redis
├── RBAC granulaire (admin, user, moderator)
└── Logs structurés avec correlation ID

Phase 2 — Sécurité avancée (2-4 semaines)
├── MFA TOTP (Google Authenticator)
├── ABAC basé sur IP/heure/user-agent
├── Micro-segmentation réseau Docker
└── Chiffrement MongoDB at-rest

Phase 3 — Device Trust & Observabilité (4-6 semaines)
├── Device Trust middleware
├── Risk scoring dynamique
├── Intégration SIEM (Elastic Stack)
└── Dashboard Grafana sécurité
```

---

## 12. Références

| Standard / Ressource | Organisation | Lien |
|---------------------|-------------|------|
| NIST SP 800-207 Zero Trust Architecture | NIST | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/sp/800-207/final) |
| BeyondCorp — A New Approach to Enterprise Security | Google | [cloud.google.com/beyondcorp](https://cloud.google.com/beyondcorp) |
| Zero-Trust Architecture Framework | Microsoft | [learn.microsoft.com](https://learn.microsoft.com/en-us/security/zero-trust/) |
| OWASP Top 10 | OWASP | [owasp.org/Top10](https://owasp.org/Top10/) |
| Express.js Security Best Practices | Express.js | [expressjs.com/advanced/best-practice-security](https://expressjs.com/en/advanced/best-practice-security.html) |
| JWT Best Practices (RFC 8725) | IETF | [datatracker.ietf.org/doc/html/rfc8725](https://datatracker.ietf.org/doc/html/rfc8725) |
| Helmet.js Documentation | Helmet | [helmetjs.github.io](https://helmetjs.github.io/) |

---

## 📌 Note IPP

Ce document constitue le rapport d'architecture technique pour le projet de pratique professionnelle de 450 heures au sein de l'**Instituto Profesional Provincial (IPP)**.

L'architecture SentinelGate démontre :
- ✅ Maîtrise du modèle Zero-Trust moderne (NIST 800-207)
- ✅ Compréhension des microservices et de leur sécurisation
- ✅ Sécurité avancée : IAM, MFA, RBAC, ABAC, Device Trust
- ✅ Architecture cloud-ready et scalable
- ✅ Conformité aux standards industriels (NIST, OWASP, RFC 8725)
- ✅ Observabilité complète (SIEM, IDS/IPS, monitoring)

---

*Dernière mise à jour : Mars 2026 — Robenson Louissaint*
