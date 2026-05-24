# BiblioUni — Application de Gestion de Bibliothèque Universitaire

Application web fullstack complète de gestion de bibliothèque universitaire avec recherche intelligente, système d'emprunts/réservations, recommandations personnalisées et tableau de bord administrateur.

## Stack Technique

- **Frontend & Backend** : Next.js 13 (Pages Router)
- **Base de données** : MySQL avec `mysql2`
- **Authentification** : JWT + Cookies HTTPOnly + bcryptjs
- **Styles** : Tailwind CSS
- **HTTP Client** : Axios
- **Upload fichiers** : Multer

## Prérequis

- Node.js ≥ 16
- MySQL ≥ 8.0

## Installation

### 1. Cloner et installer les dépendances

```bash
cd library-app
npm install
```

### 2. Configurer la base de données

Créer une base de données MySQL et exécuter les scripts dans l'ordre :

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=library_db
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Lancer l'application

```bash
npm run dev
```

Accéder à [http://localhost:3000](http://localhost:3000)

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@library.com | password |
| Bibliothécaire | marie@library.com | password |
| Utilisateur | ahmed@library.com | password |
| Utilisateur | sophie@library.com | password |

## Fonctionnalités

### Authentification
- Inscription / Connexion / Déconnexion
- JWT stocké en cookie HTTPOnly sécurisé
- Gestion des rôles : admin, bibliothécaire, utilisateur
- Hashage bcrypt des mots de passe

### Catalogue
- Navigation et filtrage par catégorie
- Tri par popularité, date, alphabétique
- Affichage de la disponibilité en temps réel
- Fiche détaillée avec liste des exemplaires
- Upload d'image de couverture

### Recherche Intelligente
- Recherche par titre, auteur, description, catégorie
- Suppression automatique des stop words (FR + EN)
- Score heuristique :
  - Mot dans titre → +5 pts
  - Mot dans auteur → +4 pts
  - Mot dans description → +3 pts
  - Même catégorie → +2 pts
  - Popularité → jusqu'à +5 pts
- Résultats triés par score décroissant
- Historique de recherche (localStorage)

### Recommandations
- Basées sur l'historique d'emprunts
- Livres de même catégorie
- Mots-clés communs
- Popularité générale (nouveaux utilisateurs)

### Emprunts
- Création d'emprunt par bibliothécaire/admin
- Enregistrement de retour avec calcul d'amende (0,50 €/jour)
- Notification automatique de retard
- Mise à jour automatique de la disponibilité des exemplaires
- Déclenchement automatique des réservations en attente au retour

### Réservations
- Réservation de livre indisponible
- Notification automatique à l'utilisateur quand un exemplaire est rendu
- Annulation de réservation

### Profil Utilisateur
- Historique des emprunts avec statut
- Réservations en cours
- Notifications (lues/non lues)
- Édition du profil

### Administration
- Tableau de bord avec statistiques globales
- Livres populaires, retards en cours, emprunts récents
- Statistiques par catégorie
- CRUD complet : Livres, Catégories, Exemplaires
- Gestion des emprunts (création + retour)
- Gestion des réservations
- Gestion des utilisateurs (modifier rôle, désactiver, supprimer)

## Architecture

```
library-app/
├── pages/
│   ├── api/
│   │   ├── auth/       # login, register, logout, me
│   │   ├── books/      # CRUD livres
│   │   ├── categories/ # CRUD catégories
│   │   ├── copies/     # CRUD exemplaires
│   │   ├── borrows/    # emprunts + retours
│   │   ├── reservations/
│   │   ├── users/      # profil, notifications, recommandations
│   │   └── admin/      # stats, gestion utilisateurs
│   ├── admin/          # pages admin (dashboard, books, etc.)
│   ├── auth/           # login, register
│   ├── catalogue/      # liste + détail livre
│   ├── index.js        # accueil
│   ├── search.js       # recherche intelligente
│   └── profile.js      # profil utilisateur
├── components/
│   ├── layout/         # Navbar, AdminSidebar, Layout, AdminLayout
│   └── ui/             # BookCard, Modal, Alert, Pagination, etc.
├── lib/
│   ├── db.js           # connexion MySQL
│   ├── auth.js         # JWT, cookies
│   ├── search.js       # moteur de recherche heuristique
│   ├── recommendations.js
│   └── upload.js       # Multer
├── styles/
│   └── globals.css
├── sql/
│   ├── schema.sql
│   └── seed.sql
└── public/
    └── uploads/        # images de couverture
```

## Build Production

```bash
npm run build
npm start
```
