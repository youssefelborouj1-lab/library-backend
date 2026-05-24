# BiblioUni — Backend Spring Boot

Backend Spring Boot 3 / Java 21 remplaçant les API NextJS du projet de bibliothèque universitaire.

## Stack

- Java 21
- Spring Boot 3.2.3
- Spring Web + Spring Data JPA + Spring Security
- MySQL 8
- JWT (jjwt 0.12.5)
- BCrypt
- Lombok
- Maven

## Prérequis

- Java 21+
- Maven 3.9+
- MySQL 8+

## Installation

### 1. Base de données

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

### 2. Configuration

Éditer `src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE

jwt.secret=une_cle_secrete_longue_et_aleatoire_minimum_32_caracteres
app.frontend.url=http://localhost:3000
app.upload.dir=./uploads
```

### 3. Lancer

```bash
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

## Connecter le frontend

Dans le projet NextJS, remplacer toutes les URLs d'API :

```
/api/... → http://localhost:8080/api/...
```

**Option recommandée** : modifier `next.config.js` pour proxifier :

```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
```

Avec cette configuration, aucune modification du code frontend n'est nécessaire.

## Endpoints reproduits

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/register | Inscription |
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Utilisateur courant |

### Livres
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/books | Liste (search, category, page, limit, sort) |
| POST | /api/books | Créer (multipart) |
| GET | /api/books/{id} | Détail + exemplaires + similaires |
| PUT | /api/books/{id} | Modifier (multipart) |
| DELETE | /api/books/{id} | Supprimer |

### Catégories
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/categories | Liste avec book_count |
| POST | /api/categories | Créer |
| PUT | /api/categories/{id} | Modifier |
| DELETE | /api/categories/{id} | Supprimer |

### Exemplaires
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/copies?book_id= | Liste par livre |
| POST | /api/copies | Créer |
| PUT | /api/copies/{id} | Modifier |
| DELETE | /api/copies/{id} | Supprimer |

### Emprunts
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/borrows | Liste (staff: tous, user: les siens) |
| POST | /api/borrows | Créer emprunt |
| PUT | /api/borrows/{id} | Enregistrer retour |

### Réservations
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/reservations | Liste |
| POST | /api/reservations | Créer |
| DELETE | /api/reservations/{id} | Annuler |

### Utilisateur
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/users/profile | Profil + stats |
| PUT | /api/users/profile | Modifier profil |
| GET | /api/users/notifications | Notifications |
| PUT | /api/users/notifications | Marquer tout lu |
| GET | /api/users/recommendations | Recommandations |

### Admin
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | Liste utilisateurs |
| PUT | /api/admin/users?id= | Modifier utilisateur |
| DELETE | /api/admin/users?id= | Supprimer utilisateur |

## Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@library.com | password |
| Bibliothécaire | marie@library.com | password |
| Utilisateur | ahmed@library.com | password |

## Authentification

Le système utilise des cookies HTTPOnly (`library_token`) exactement comme le frontend NextJS.
Aucune modification de logique d'authentification côté frontend n'est nécessaire.

## Upload d'images

Les images uploadées sont servies sur `/uploads/{filename}`.
Le dossier de stockage est configurable via `app.upload.dir` dans `application.properties`.
