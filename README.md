# 📚 BiblioUni — Application de Gestion de Bibliothèque Universitaire

> Application web fullstack intelligente pour la gestion et la consultation d'une bibliothèque universitaire. Elle couvre l'ensemble du cycle de vie d'un livre : catalogue, emprunts, réservations, recommandations personnalisées et administration complète.

---

## Table des matières

1. [Contexte](#contexte)
2. [Fonctionnalités](#fonctionnalités)
3. [Technologies utilisées](#technologies-utilisées)
4. [Prérequis](#prérequis)
5. [Structure des dossiers](#structure-des-dossiers)
6. [Installation sans Docker](#installation-sans-docker)
7. [Installation avec Docker](#installation-avec-docker)
8. [Comptes de démonstration](#comptes-de-démonstration)
9. [Routes API](#routes-api)
10. [Modèle de données](#modèle-de-données)
11. [Variables d'environnement](#variables-denvironnement)

---

## Contexte

**BiblioUni** est une application web destinée aux bibliothèques universitaires souhaitant moderniser leur gestion documentaire. Elle permet aux étudiants et enseignants de consulter le catalogue en ligne, d'emprunter et de réserver des livres, tout en offrant aux bibliothécaires et administrateurs un tableau de bord complet pour piloter les stocks, les emprunts en cours et les retards.

Le projet est architecturé en deux parties distinctes et indépendantes :

- **Frontend** : interface utilisateur moderne construite avec React.js / Next.js et Tailwind CSS.
- **Backend** : API REST robuste développée avec Spring Boot 3, exposant tous les services métier.

Les deux services communiquent via HTTP et peuvent être déployés ensemble grâce à Docker Compose.

---

## Fonctionnalités

### 🔐 Authentification & Sécurité
- Inscription / Connexion / Déconnexion
- Authentification par **JWT** stocké en cookie **HTTPOnly** sécurisé
- Hachage des mots de passe avec **BCrypt**
- Gestion des rôles : `admin`, `bibliothecaire`, `utilisateur`
- Protection des routes par rôle

### 📖 Catalogue
- Consultation de tous les livres avec pagination
- Filtrage par catégorie
- Tri par popularité, date d'ajout ou ordre alphabétique
- Fiche détaillée : informations complètes, liste des exemplaires, disponibilité en temps réel
- Upload d'image de couverture
- CRUD complet (admin / bibliothécaire)

### 🔍 Recherche intelligente
- Recherche multi-critères : titre, auteur, description, catégorie
- **Suppression automatique des stop words** (français + anglais)
- **Score heuristique** de pertinence :
  - Mot trouvé dans le titre → **+5 pts**
  - Mot trouvé dans l'auteur → **+4 pts**
  - Mot trouvé dans la description → **+3 pts**
  - Même catégorie → **+2 pts**
  - Popularité (emprunts) → jusqu'à **+5 pts**
- Résultats triés par score décroissant
- Historique des recherches récentes (localStorage)

### 🤖 Recommandations personnalisées
- Analyse de l'historique d'emprunts de l'utilisateur
- Suggestions basées sur les catégories préférées
- Correspondance par mots-clés entre les livres lus et le catalogue
- Popularité générale pour les nouveaux utilisateurs

### 📋 Emprunts
- Création d'un emprunt par le personnel (bibliothécaire / admin)
- Enregistrement du retour avec calcul automatique de l'amende (0,50 € / jour de retard)
- Mise à jour automatique de la disponibilité des exemplaires au retour
- Notification automatique à l'utilisateur lors de la création et du retour
- Déclenchement automatique des réservations en attente lors d'un retour

### 🔖 Réservations
- Réservation d'un livre indisponible
- Notification automatique quand un exemplaire se libère
- Annulation possible par l'utilisateur ou le personnel
- Expiration automatique après 7 jours (ou 3 jours après confirmation)

### 🔔 Notifications
- Centre de notifications intégré dans la navbar
- Badge de notification non-lues en temps réel
- Marquer tout comme lu en un clic
- Types : `info`, `success`, `warning`, `error`

### 👤 Espace personnel
- Tableau de bord avec statistiques personnelles
- Historique complet des emprunts avec statut
- Liste des réservations actives
- Modification du profil (nom, téléphone, adresse, mot de passe)

### 🛠️ Administration
- **Tableau de bord** : statistiques globales, livres populaires, retards en cours, emprunts récents, statistiques par catégorie
- **Gestion des livres** : CRUD complet avec upload de couverture
- **Gestion des catégories** : CRUD
- **Gestion des exemplaires** : CRUD, suivi du statut par exemplaire
- **Gestion des emprunts** : création, enregistrement des retours, filtrage par statut
- **Gestion des réservations** : suivi et annulation
- **Gestion des utilisateurs** : modification du rôle, activation/désactivation, suppression

---

## Technologies utilisées

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| [React](https://react.dev/) | 18.2 | Interface utilisateur |
| [Next.js](https://nextjs.org/) | 13.5 | Framework React (Pages Router) |
| [Tailwind CSS](https://tailwindcss.com/) | 3.3 | Styles utilitaires |
| [Axios](https://axios-http.com/) | 1.5 | Client HTTP |
| [React Icons](https://react-icons.github.io/react-icons/) | 4.11 | Icônes |

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| [Java](https://openjdk.org/) | 17 | Langage |
| [Spring Boot](https://spring.io/projects/spring-boot) | 3.2.3 | Framework applicatif |
| [Spring Data JPA](https://spring.io/projects/spring-data-jpa) | — | ORM / accès base de données |
| [Spring Security](https://spring.io/projects/spring-security) | — | Authentification et autorisation |
| [JJWT](https://github.com/jwtk/jjwt) | 0.12.5 | Génération et validation des tokens JWT |
| [BCrypt](https://docs.spring.io/spring-security/) | — | Hachage des mots de passe |
| [Lombok](https://projectlombok.org/) | — | Réduction du code boilerplate |
| [Maven](https://maven.apache.org/) | 3.9 | Gestionnaire de dépendances |

### Base de données
| Technologie | Version | Rôle |
|-------------|---------|------|
| [MySQL](https://www.mysql.com/) | 8.0 | Base de données relationnelle |

### DevOps
| Technologie | Rôle |
|-------------|------|
| [Docker](https://www.docker.com/) | Conteneurisation des services |
| [Docker Compose](https://docs.docker.com/compose/) | Orchestration multi-conteneurs |

---

## Prérequis

### Sans Docker
- **Node.js** ≥ 18 et **npm** ≥ 9
- **Java** ≥ 17 (JDK)
- **Maven** ≥ 3.9
- **MySQL** ≥ 8.0

### Avec Docker *(recommandé)*
- **Docker Desktop**

---

## Structure des dossiers

```
library_app/
│
├── docker-compose.yml              # Orchestration des 3 services (mysql, backend, frontend)
│
├── database/                       # Fichiers d'initialisation de la base de données
│   ├── schema.sql                  # Création des tables
│   └── seed.sql                    # Données de test
│
├── frontend/                       # Application Next.js
│   ├── Dockerfile
│   ├── next.config.js              # Proxy /api/* → backend:8081
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── .env.example
│   ├── public/
│   │   └── uploads/                # Images de couverture (hors Docker)
│   ├── styles/
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.js
│   │   │   ├── AdminSidebar.js
│   │   │   ├── Layout.js
│   │   │   └── AdminLayout.js
│   │   └── ui/
│   │       ├── BookCard.js
│   │       ├── Modal.js
│   │       ├── Alert.js
│   │       ├── Pagination.js
│   │       ├── LoadingSpinner.js
│   │       ├── EmptyState.js
│   │       └── StatCard.js
│   ├── lib/                        # Utilitaires (auth, db, search, recommendations)
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── search.js
│   │   ├── recommendations.js
│   │   └── upload.js
│   └── pages/
│       ├── _app.js
│       ├── _document.js
│       ├── index.js                # Page d'accueil
│       ├── search.js               # Recherche intelligente
│       ├── profile.js              # Espace personnel
│       ├── 404.js
│       ├── auth/
│       │   ├── login.js
│       │   └── register.js
│       ├── catalogue/
│       │   ├── index.js            # Liste des livres
│       │   └── [id].js             # Fiche détaillée
│       ├── admin/
│       │   ├── index.js            # Dashboard admin
│       │   ├── books.js
│       │   ├── categories.js
│       │   ├── copies.js
│       │   ├── borrows.js
│       │   ├── reservations.js
│       │   └── users.js
│       └── api/                    # Routes API Next.js (remplacées par Spring Boot)
│           ├── auth/
│           ├── books/
│           ├── categories/
│           ├── copies/
│           ├── borrows/
│           ├── reservations/
│           ├── users/
│           └── admin/
│
└── backend/                        # Application Spring Boot
    ├── Dockerfile
    ├── pom.xml
    ├── sql/
    │   ├── schema.sql              # Schéma de la base de données
    │   └── seed.sql                # Données de démonstration
    └── src/main/
        ├── resources/
        │   └── application.properties
        └── java/com/library/
            ├── LibraryApplication.java
            ├── config/
            │   ├── SecurityConfig.java      # Spring Security + CORS
            │   ├── FileStorageConfig.java   # Serveur de fichiers statiques
            │   └── GlobalExceptionHandler.java
            ├── security/
            │   ├── JwtUtil.java             # Génération / validation JWT
            │   ├── JwtAuthFilter.java       # Filtre HTTP JWT
            │   └── AuthUser.java            # Principal de sécurité
            ├── entity/
            │   ├── User.java
            │   ├── Role.java
            │   ├── Book.java
            │   ├── Category.java
            │   ├── Copy.java
            │   ├── Borrow.java
            │   ├── Reservation.java
            │   └── Notification.java
            ├── repository/
            │   ├── UserRepository.java
            │   ├── RoleRepository.java
            │   ├── BookRepository.java
            │   ├── CategoryRepository.java
            │   ├── CopyRepository.java
            │   ├── BorrowRepository.java
            │   ├── ReservationRepository.java
            │   └── NotificationRepository.java
            ├── dto/request/
            │   ├── LoginRequest.java
            │   ├── RegisterRequest.java
            │   ├── UpdateProfileRequest.java
            │   ├── CreateBorrowRequest.java
            │   ├── CreateReservationRequest.java
            │   ├── CategoryRequest.java
            │   ├── CopyRequest.java
            │   └── UpdateUserRequest.java
            ├── service/
            │   ├── SearchService.java        # Algorithme de recherche heuristique
            │   ├── RecommendationService.java
            │   ├── NotificationService.java
            │   └── FileStorageService.java
            ├── controller/
            │   ├── AuthController.java
            │   ├── BookController.java
            │   ├── CategoryController.java
            │   ├── CopyController.java
            │   ├── BorrowController.java
            │   ├── ReservationController.java
            │   ├── UserController.java
            │   └── AdminController.java
            └── util/
                └── ResponseMapper.java       # Mapping entités → JSON
```

---

## Installation sans Docker

### 1. Cloner le dépôt

```bash
git clone https://github.com/xxx/xxx.git
cd xxx
```

### 2. Base de données MySQL

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p < backend/sql/seed.sql
```

### 3. Backend Spring Boot

Éditer `backend/src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE_MYSQL

jwt.secret=une_cle_secrete_longue_minimum_32_caracteres
app.frontend.url=http://localhost:3000
app.upload.dir=./uploads
```

Lancer le backend :

```bash
cd backend
mvn spring-boot:run
# Démarre sur http://localhost:8081
```

### 4. Frontend Next.js

Créer le fichier d'environnement :

```bash
cd frontend
cp .env.example .env
```

Contenu de `frontend/.env` :

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Vérifier que `frontend/next.config.js` contient le proxy vers le backend :

```js
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*',
      },
    ];
  },
};
```

Installer et lancer :

```bash
npm install
npm run build
npm start
# Démarre sur http://localhost:3000
```

---

## Installation avec Docker

> ✅ Méthode recommandée. MySQL, le backend et le frontend démarrent automatiquement.

### 1. Cloner le dépôt

```bash
git clone https://github.com/xxx/xxx.git
cd xxx
```

### 2. Vérifier `frontend/next.config.js`

Le frontend doit pointer vers le service Docker `backend` :

```js
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8081/api/:path*',
      },
    ];
  },
};
```

### 3. Lancer tous les services

```bash
docker compose up --build
```

L'ordre de démarrage est géré automatiquement :

```
MySQL (health check) → Backend Spring Boot → Frontend Next.js
```

### 4. Accéder à l'application

| Service | URL |
|---------|-----|
| 🌐 Application web | http://localhost:3000 |
| ⚙️ API REST | http://localhost:8081/api |
| 🗄️ MySQL | localhost:3306 |

### Commandes Docker utiles

```bash
# Lancer en arrière-plan
docker compose up --build -d

# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Arrêter les services
docker compose down

# Arrêter et supprimer les données (reset complet)
docker compose down -v

# Reconstruire un seul service
docker compose up --build backend
```

---

## Comptes de démonstration

> Mot de passe identique pour tous les comptes : **`password`**

| Rôle | Email | Accès |
|------|-------|-------|
| 👑 Administrateur | admin@library.com | Toutes les fonctionnalités |
| 📚 Bibliothécaire | marie@library.com | Catalogue, emprunts, réservations |
| 🎓 Utilisateur | ahmed@library.com | Catalogue, profil, réservations |
| 🎓 Utilisateur | sophie@library.com | Catalogue, profil, réservations |

---

## Routes API

Toutes les routes sont préfixées par `/api`.

### Authentification

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `POST` | `/api/auth/register` | Public | Créer un compte |
| `POST` | `/api/auth/login` | Public | Se connecter |
| `POST` | `/api/auth/logout` | Public | Se déconnecter |
| `GET` | `/api/auth/me` | Connecté | Utilisateur courant |

### Livres

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/books` | Public | Liste paginée (search, category, sort) |
| `GET` | `/api/books/{id}` | Public | Détail + exemplaires + similaires |
| `POST` | `/api/books` | Staff | Créer un livre (multipart) |
| `PUT` | `/api/books/{id}` | Staff | Modifier un livre |
| `DELETE` | `/api/books/{id}` | Staff | Supprimer un livre |

### Catégories

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/categories` | Public | Liste avec compteur de livres |
| `POST` | `/api/categories` | Staff | Créer |
| `PUT` | `/api/categories/{id}` | Staff | Modifier |
| `DELETE` | `/api/categories/{id}` | Staff | Supprimer |

### Exemplaires

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/copies?book_id=` | Staff | Liste par livre |
| `POST` | `/api/copies` | Staff | Créer |
| `PUT` | `/api/copies/{id}` | Staff | Modifier |
| `DELETE` | `/api/copies/{id}` | Staff | Supprimer |

### Emprunts

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/borrows` | Connecté | Liste (staff : tous, user : les siens) |
| `POST` | `/api/borrows` | Staff | Créer un emprunt |
| `PUT` | `/api/borrows/{id}` | Staff | Enregistrer un retour |

### Réservations

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/reservations` | Connecté | Liste |
| `POST` | `/api/reservations` | Connecté | Créer une réservation |
| `DELETE` | `/api/reservations/{id}` | Connecté | Annuler |

### Utilisateur

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/users/profile` | Connecté | Profil + statistiques |
| `PUT` | `/api/users/profile` | Connecté | Modifier le profil |
| `GET` | `/api/users/notifications` | Connecté | Liste des notifications |
| `PUT` | `/api/users/notifications` | Connecté | Marquer tout comme lu |
| `GET` | `/api/users/recommendations` | Connecté | Recommandations personnalisées |

### Administration

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| `GET` | `/api/admin/stats` | Staff | Statistiques globales du dashboard |
| `GET` | `/api/admin/users` | Staff | Liste de tous les utilisateurs |
| `PUT` | `/api/admin/users?id=` | Admin | Modifier un utilisateur |
| `DELETE` | `/api/admin/users?id=` | Admin | Supprimer un utilisateur |

---

## Variables d'environnement

### Backend — `application.properties`

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/library_db` | URL de connexion MySQL |
| `spring.datasource.username` | `root` | Utilisateur MySQL |
| `spring.datasource.password` | — | Mot de passe MySQL |
| `jwt.secret` | — | Clé secrète JWT (min. 32 caractères) |
| `jwt.expiration` | `604800000` | Durée du token en ms (7 jours) |
| `app.frontend.url` | `http://localhost:3000` | URL du frontend (CORS) |
| `app.upload.dir` | `./uploads` | Dossier de stockage des images |
| `server.port` | `8081` | Port d'écoute du backend |

### Frontend — `.env`

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | URL publique du frontend |

### Docker Compose — variables d'environnement du service `mysql`

| Variable | Description |
|----------|-------------|
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL |
| `MYSQL_DATABASE` | Nom de la base (`library_db`) |
| `MYSQL_USER` | Utilisateur applicatif |
| `MYSQL_PASSWORD` | Mot de passe utilisateur applicatif |

---

## Licence

Projet réalisé à des fins académiques et pédagogiques.