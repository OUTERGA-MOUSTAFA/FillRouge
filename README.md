<div align="center">

<img src="public/favicon.svg" alt="Semsar" width="96" height="96" />

# 🏠 Semsar — Roommate & Room-Rental Marketplace

**Find your ideal roommate. List your room. Match by lifestyle.**
*Trouvez votre colocataire idéal. Publiez votre chambre. Matchez par style de vie.*

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#-license--licence)
[![Market](https://img.shields.io/badge/market-🇲🇦%20Morocco-c1272d?style=flat-square)](#)
[![Status](https://img.shields.io/badge/status-active%20development-blue?style=flat-square)](#)

<br/>

### 🌐 **[English](#-english)** &nbsp;•&nbsp; **[Français](#-français)**

</div>

---

<a name="-english"></a>

## 🇬🇧 English

### 📖 Overview

**Semsar** (Arabic for *"broker"*) is a full-stack web platform that helps people **find compatible roommates** and **rent out rooms**, tailored for the **Moroccan market** (MAD currency, CMI payment gateway, multilingual support).

Beyond a classic listing board, Semsar runs a **compatibility-matching engine** that scores users against each other on budget, interests, lifestyle, age and gender — so you don't just find *a* room, you find the *right* people to live with.

> The repository is named `FillRouge` (a final-year project), while the product brand is **Semsar**.

### ✨ Key Features

| Domain | What it does |
| --- | --- |
| 🔐 **Authentication** | Register / login, email + phone verification, password reset, **2FA**, Google & Facebook **OAuth** |
| 🏘️ **Listings** | Full CRUD with photos, geolocation (lat/lng), amenities, *featured* / *urgent* flags, view & contact counters, soft deletes |
| 🤝 **Smart Matching** | Compatibility score — **Budget 20% · Interests 30% · Lifestyle 30% · Age 10% · Gender 10%** |
| 💬 **Messaging** | Per-user conversations with daily limits gated by subscription tier + real-time updates |
| 💳 **Subscriptions** | `Free` / `Standard` / `Premium` tiers driving listing quotas, message quotas & featured perks |
| 🛡️ **Trust & Safety** | ID-document upload, third-party background checks, income verification, block & report, badges |
| 🗺️ **Maps** | Interactive listing maps powered by Leaflet |
| 🌍 **i18n** | Multilingual UI (Arabic locale shipped) |
| ⚙️ **Admin Panel** | Dashboard, user & listing moderation, reports, homepage sliders, income-verification approvals, stats |

### 🧱 Tech Stack

**Backend**
- [Laravel 13](https://laravel.com) · PHP 8.3
- [Sanctum](https://laravel.com/docs/sanctum) — API token authentication
- [Reverb](https://reverb.laravel.com) — WebSockets / real-time
- [Socialite](https://laravel.com/docs/socialite) — Google / Facebook OAuth
- [Stripe](https://stripe.com) + **CMI** (Moroccan payment gateway)
- [Twilio](https://twilio.com) — SMS 2FA
- Simple QR Code · Intervention Image
- [Pest 4](https://pestphp.com) — testing · [Pint](https://laravel.com/docs/pint) — code style

**Frontend** (standalone SPA in `frontend/`)
- [React 19](https://react.dev) + [Vite 8](https://vitejs.dev)
- [React Router 7](https://reactrouter.com) · [Zustand](https://zustand-demo.pmnd.rs) (state) · [Axios](https://axios-http.com)
- [Tailwind CSS 4](https://tailwindcss.com) · [Headless UI](https://headlessui.com) · [Heroicons](https://heroicons.com)
- [Leaflet](https://leafletjs.com) (maps) · [Swiper](https://swiperjs.com) · [socket.io-client](https://socket.io)
- React Hook Form · React Hot Toast · i18n

**Database:** SQLite by default · MySQL ready (commented config in `.env.example`)

### 🏗️ Architecture

```
FillRouge/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   → 14 API controllers (Auth, Listing, Match, Message, Payment, Admin…)
│   │   └── Middleware/        → Admin, PremiumUser, RateLimitMessages, Verified{Email,Phone,Identity}
│   ├── Models/                → 14 models (User, Listing, Matching, Message, Subscription…)
│   ├── Policies/              → Listing, Message, Review, User
│   └── Services/              → 8 domain services
│       ├── MatchingService        → compatibility scoring engine
│       ├── PaymentService         → Stripe + CMI
│       ├── NotificationService
│       ├── OAuthService · SmsService · TwoFactorService
│       └── BackgroundCheckService · ImageService
├── routes/api.php             → the entire API surface (~200 lines)
├── database/migrations/       → 21 migrations
└── frontend/                  → standalone React 19 SPA (the actual UI)
    ├── pages/                 → Home, Listings, Messages, Profile, Auth/*, Admin/*, Subscription/*
    └── src/
        ├── services/          → Axios wrappers per resource
        ├── store/             → Zustand auth store
        ├── components/ · hooks/ · locales/ · i18n.js
```

> **Note** — The Laravel root ships the Inertia/React starter (`resources/`), but the **production UI lives in `frontend/`**: a standalone SPA that consumes the Laravel API. There are two `node_modules` / `package.json` trees (root + `frontend/`).

### 🚀 Getting Started

#### Prerequisites
- PHP **8.3+** · Composer
- Node.js **18+** · npm
- (optional) MySQL — SQLite works out of the box

#### 1 · Backend (Laravel API)

```bash
# Install PHP dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate

# Database (SQLite by default)
php artisan migrate

# Run the API + queue + websockets
php artisan serve            # http://localhost:8000
php artisan queue:listen     # background jobs
php artisan reverb:start     # real-time websockets
```

#### 2 · Frontend (React SPA)

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Point the SPA to the API via `frontend` env / Vite config:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
```

#### 3 · Create an admin user

```bash
php artisan tinker
```
```php
$user = new App\Models\User();
$user->full_name = "Admin";
$user->email = "admin@email.com";
$user->password = Hash::make('12345678');
$user->role = 'admin';
$user->save();
```

### 🔌 API Quick Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register (rate-limited) |
| `POST` | `/api/auth/login` | Login |
| `GET`  | `/api/listings` | Public listings (+ `/listings/search`) |
| `POST` | `/api/listings` | Create a listing 🔒 |
| `GET`  | `/api/matches` | Recommended matches 🔒 |
| `GET`  | `/api/messages/conversations` | Conversations 🔒 |
| `POST` | `/api/subscription/checkout` | Start a subscription 🔒 |
| `GET`  | `/api/admin/stats` | Admin statistics 🔒👑 |

🔒 = authenticated (Sanctum) · 👑 = admin only · See `routes/api.php` for the full surface.

### 🧪 Testing & Quality

```bash
composer test          # Pest test suite + lint check
composer lint          # Pint (code style)
npm run lint           # ESLint (frontend)
npm run types:check    # TypeScript type checking
```

---

<a name="-français"></a>

## 🇫🇷 Français

### 📖 Présentation

**Semsar** (*"courtier"* en arabe) est une plateforme web full-stack qui aide les utilisateurs à **trouver des colocataires compatibles** et à **louer des chambres**, pensée pour le **marché marocain** (devise MAD, passerelle de paiement CMI, support multilingue).

Au-delà d'un simple tableau d'annonces, Semsar embarque un **moteur de matching par compatibilité** qui évalue les utilisateurs entre eux selon le budget, les centres d'intérêt, le style de vie, l'âge et le genre — pour ne pas seulement trouver *une* chambre, mais les *bonnes* personnes avec qui vivre.

> Le dépôt s'appelle `FillRouge` (projet de fin d'études), tandis que la marque du produit est **Semsar**.

### ✨ Fonctionnalités clés

| Domaine | Description |
| --- | --- |
| 🔐 **Authentification** | Inscription / connexion, vérification e-mail + téléphone, réinitialisation du mot de passe, **2FA**, **OAuth** Google & Facebook |
| 🏘️ **Annonces** | CRUD complet avec photos, géolocalisation (lat/lng), équipements, badges *vedette* / *urgent*, compteurs de vues & contacts, suppression douce |
| 🤝 **Matching intelligent** | Score de compatibilité — **Budget 20 % · Intérêts 30 % · Style de vie 30 % · Âge 10 % · Genre 10 %** |
| 💬 **Messagerie** | Conversations par utilisateur, limites journalières selon l'abonnement + mises à jour en temps réel |
| 💳 **Abonnements** | Offres `Gratuit` / `Standard` / `Premium` pilotant les quotas d'annonces, de messages et les avantages *vedette* |
| 🛡️ **Confiance & Sécurité** | Upload de pièce d'identité, vérification d'antécédents (tiers), vérification de revenus, blocage & signalement, badges |
| 🗺️ **Cartes** | Cartes d'annonces interactives propulsées par Leaflet |
| 🌍 **i18n** | Interface multilingue (locale arabe incluse) |
| ⚙️ **Panneau admin** | Tableau de bord, modération utilisateurs & annonces, signalements, sliders d'accueil, validation des revenus, statistiques |

### 🧱 Stack technique

**Backend**
- [Laravel 13](https://laravel.com) · PHP 8.3
- [Sanctum](https://laravel.com/docs/sanctum) — authentification par token API
- [Reverb](https://reverb.laravel.com) — WebSockets / temps réel
- [Socialite](https://laravel.com/docs/socialite) — OAuth Google / Facebook
- [Stripe](https://stripe.com) + **CMI** (passerelle de paiement marocaine)
- [Twilio](https://twilio.com) — SMS 2FA
- Simple QR Code · Intervention Image
- [Pest 4](https://pestphp.com) — tests · [Pint](https://laravel.com/docs/pint) — style de code

**Frontend** (SPA autonome dans `frontend/`)
- [React 19](https://react.dev) + [Vite 8](https://vitejs.dev)
- [React Router 7](https://reactrouter.com) · [Zustand](https://zustand-demo.pmnd.rs) (état) · [Axios](https://axios-http.com)
- [Tailwind CSS 4](https://tailwindcss.com) · [Headless UI](https://headlessui.com) · [Heroicons](https://heroicons.com)
- [Leaflet](https://leafletjs.com) (cartes) · [Swiper](https://swiperjs.com) · [socket.io-client](https://socket.io)
- React Hook Form · React Hot Toast · i18n

**Base de données :** SQLite par défaut · MySQL prêt à l'emploi (config commentée dans `.env.example`)

### 🏗️ Architecture

```
FillRouge/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/   → 14 contrôleurs API (Auth, Listing, Match, Message, Payment, Admin…)
│   │   └── Middleware/        → Admin, PremiumUser, RateLimitMessages, Verified{Email,Phone,Identity}
│   ├── Models/                → 14 modèles (User, Listing, Matching, Message, Subscription…)
│   ├── Policies/              → Listing, Message, Review, User
│   └── Services/              → 8 services métier
│       ├── MatchingService        → moteur de score de compatibilité
│       ├── PaymentService         → Stripe + CMI
│       ├── NotificationService
│       ├── OAuthService · SmsService · TwoFactorService
│       └── BackgroundCheckService · ImageService
├── routes/api.php             → toute la surface de l'API (~200 lignes)
├── database/migrations/       → 21 migrations
└── frontend/                  → SPA React 19 autonome (l'interface réelle)
    ├── pages/                 → Home, Listings, Messages, Profile, Auth/*, Admin/*, Subscription/*
    └── src/
        ├── services/          → wrappers Axios par ressource
        ├── store/             → store d'auth Zustand
        ├── components/ · hooks/ · locales/ · i18n.js
```

> **Note** — La racine Laravel embarque le starter Inertia/React (`resources/`), mais **l'interface de production se trouve dans `frontend/`** : une SPA autonome qui consomme l'API Laravel. Il y a deux arborescences `node_modules` / `package.json` (racine + `frontend/`).

### 🚀 Démarrage

#### Prérequis
- PHP **8.3+** · Composer
- Node.js **18+** · npm
- (optionnel) MySQL — SQLite fonctionne immédiatement

#### 1 · Backend (API Laravel)

```bash
# Installer les dépendances PHP
composer install

# Environnement
cp .env.example .env
php artisan key:generate

# Base de données (SQLite par défaut)
php artisan migrate

# Lancer l'API + la file + les websockets
php artisan serve            # http://localhost:8000
php artisan queue:listen     # tâches en arrière-plan
php artisan reverb:start     # websockets temps réel
```

#### 2 · Frontend (SPA React)

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Connectez la SPA à l'API via l'environnement / la config Vite du dossier `frontend` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
```

#### 3 · Créer un utilisateur admin

```bash
php artisan tinker
```
```php
$user = new App\Models\User();
$user->full_name = "Admin";
$user->email = "admin@email.com";
$user->password = Hash::make('12345678');
$user->role = 'admin';
$user->save();
```

### 🔌 Aperçu rapide de l'API

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Inscription (limitée) |
| `POST` | `/api/auth/login` | Connexion |
| `GET`  | `/api/listings` | Annonces publiques (+ `/listings/search`) |
| `POST` | `/api/listings` | Créer une annonce 🔒 |
| `GET`  | `/api/matches` | Matchs recommandés 🔒 |
| `GET`  | `/api/messages/conversations` | Conversations 🔒 |
| `POST` | `/api/subscription/checkout` | Démarrer un abonnement 🔒 |
| `GET`  | `/api/admin/stats` | Statistiques admin 🔒👑 |

🔒 = authentifié (Sanctum) · 👑 = admin uniquement · Voir `routes/api.php` pour la surface complète.

### 🧪 Tests & Qualité

```bash
composer test          # Suite de tests Pest + vérification du style
composer lint          # Pint (style de code)
npm run lint           # ESLint (frontend)
npm run types:check    # Vérification des types TypeScript
```

---

<div align="center">

## 📐 Diagrams / Diagrammes

UML diagrams are included in the repository. <br/> *Les diagrammes UML sont inclus dans le dépôt.*

| Classes | Use Cases |
| :---: | :---: |
| [`UML-classes.png`](UML-classes.png) | [`UML-use_cases.png`](UML-use_cases.png) |

</div>

---

## 📄 License / Licence

This project is released under the **MIT License**.
*Ce projet est distribué sous **licence MIT**.*

<div align="center">

**Made with ❤️ for the Moroccan housing market** 🇲🇦
*Conçu avec ❤️ pour le marché immobilier marocain*

⭐ *If you find this project useful, give it a star! / Si ce projet vous est utile, mettez une étoile !*

</div>
