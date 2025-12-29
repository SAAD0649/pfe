# Plateforme d'Entraide - Application Full Stack

Application de dons et d'entraide connectant donnateurs et personnes dans le besoin.

## Technologies

- **Frontend**: React.js avec Next.js 16
- **Backend**: Node.js (API Routes)
- **Base de données**: MongoDB
- **Authentification**: JWT avec bcrypt
- **UI**: Shadcn/ui + Tailwind CSS

## Fonctionnalités

### Pour les Nécessiteux
- Inscription avec compte "Nécessiteux"
- Publication de besoins avec titre, description et photo
- Dashboard personnel pour gérer ses besoins
- Visualisation de l'état des besoins (actif/inactif)

### Pour les Donnateurs
- Inscription avec compte "Donnateur"
- Consultation de tous les besoins publiés
- Publication de donations disponibles
- Dashboard avec deux onglets : besoins disponibles et mes donations

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd <nom-du-projet>
```

### 2. Installer les dépendances

```bash
npm install
# ou
pnpm install
```

### 3. Configuration de MongoDB

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster
3. Créez un utilisateur de base de données
4. Récupérez votre URI de connexion

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/donation_platform?retryWrites=true&w=majority
JWT_SECRET=votre-cle-secrete-tres-longue-et-complexe
```

**Important**: Remplacez `username`, `password` et `cluster` par vos propres valeurs MongoDB.

### 5. Lancer l'application

```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
├── app/
│   ├── api/
│   │   ├── auth/          # Routes d'authentification
│   │   ├── needs/         # Routes pour les besoins
│   │   └── donations/     # Routes pour les donations
│   ├── dashboard/
│   │   ├── necessiteux/   # Dashboard nécessiteux
│   │   └── donnateur/     # Dashboard donnateur
│   ├── signin/            # Page de connexion
│   ├── signup/            # Page d'inscription
│   └── page.js            # Page d'accueil
├── components/
│   ├── auth-provider.js   # Context d'authentification
│   └── ui/                # Composants UI
├── lib/
│   ├── mongodb.js         # Configuration MongoDB
│   └── auth.js            # Utilitaires JWT
└── .env.local.example     # Exemple de variables d'environnement
```

## API Routes

### Authentification

- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/signin` - Se connecter
- `GET /api/auth/me` - Obtenir l'utilisateur connecté

### Besoins (Nécessiteux)

- `GET /api/needs` - Obtenir tous les besoins
- `POST /api/needs` - Créer un besoin (nécessiteux uniquement)
- `GET /api/needs/my-needs` - Obtenir mes besoins

### Donations (Donnateurs)

- `GET /api/donations` - Obtenir toutes les donations
- `POST /api/donations` - Créer une donation (donnateur uniquement)
- `GET /api/donations/my-donations` - Obtenir mes donations

## Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Authentification JWT avec expiration de 7 jours
- Validation des types d'utilisateurs côté serveur
- Protection des routes API avec middleware d'authentification

## Collections MongoDB

L'application crée automatiquement les collections suivantes :

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  userType: String ("donnateur" | "necessiteux"),
  createdAt: Date
}
```

### needs
```javascript
{
  _id: ObjectId,
  userId: ObjectId (référence à users),
  title: String,
  description: String,
  imageUrl: String | null,
  status: String ("active" | "inactive"),
  createdAt: Date
}
```

### donations
```javascript
{
  _id: ObjectId,
  userId: ObjectId (référence à users),
  title: String,
  description: String,
  imageUrl: String | null,
  status: String ("available" | "unavailable"),
  createdAt: Date
}
```

## Déploiement

### Vercel (Recommandé)

1. Connectez votre dépôt GitHub à Vercel
2. Ajoutez les variables d'environnement dans les paramètres du projet
3. Déployez automatiquement à chaque push

### Variables d'environnement pour la production

```
MONGODB_URI=<votre-uri-mongodb>
JWT_SECRET=<votre-cle-secrete>
```

## Support

Pour toute question ou problème, consultez la documentation officielle :
- [Next.js](https://nextjs.org/docs)
- [MongoDB](https://docs.mongodb.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
