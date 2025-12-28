# Structure du Projet - Plateforme de Signalement Urbain

## 📁 Organisation des fichiers

```
urbains/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Routes d'authentification (groupes)
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # Espace citoyen
│   │   ├── new/                  # Créer un signalement
│   │   └── reports/[id]/         # Détail et édition
│   ├── agent/                    # Espace agent
│   │   └── reports/[id]/         # Détail et gestion
│   ├── admin/                    # Espace administrateur
│   │   ├── users/                # Gestion utilisateurs
│   │   └── categories/           # Gestion catégories
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth
│   │   ├── reports/              # CRUD signalements
│   │   └── admin/                # Administration
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Page d'accueil (redirection)
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React réutilisables
│   ├── AuthProvider.tsx          # Provider NextAuth
│   ├── Navbar.tsx                # Navigation
│   ├── NewReportForm.tsx         # Formulaire création
│   ├── EditReportForm.tsx        # Formulaire édition
│   ├── ReportActions.tsx         # Actions agent
│   ├── UserManagement.tsx        # Gestion utilisateurs
│   └── CategoryManagement.tsx    # Gestion catégories
│
├── lib/                          # Utilitaires et configuration
│   ├── prisma.ts                 # Client Prisma
│   ├── auth.ts                   # Configuration NextAuth
│   └── utils.ts                  # Fonctions utilitaires
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Schéma de base de données
│   └── seed.ts                   # Données de test
│
├── public/                       # Fichiers statiques
│   └── uploads/                  # Images uploadées (créé automatiquement)
│
├── types/                        # Types TypeScript
│   └── next-auth.d.ts            # Extensions NextAuth
│
├── .env.example                  # Exemple de variables d'environnement
├── .gitignore                    # Fichiers ignorés par Git
├── next.config.mjs               # Configuration Next.js
├── package.json                  # Dépendances et scripts
├── tailwind.config.ts            # Configuration TailwindCSS
├── tsconfig.json                 # Configuration TypeScript
├── vercel.json                   # Configuration Vercel
├── README.md                     # Documentation principale
├── SETUP.md                      # Guide de configuration
└── PROJECT_STRUCTURE.md          # Ce fichier
```

## 🗄️ Modèles de données (Prisma)

### User
- `id`: Identifiant unique
- `email`: Email (unique)
- `password`: Mot de passe hashé
- `name`: Nom complet (optionnel)
- `role`: Rôle (CITOYEN, AGENT, ADMIN)
- Relations: reportsCreated, reportsAssigned, comments, reportHistory

### Category
- `id`: Identifiant unique
- `name`: Nom (unique)
- `description`: Description (optionnelle)
- Relation: reports

### Report
- `id`: Identifiant unique
- `title`: Titre
- `description`: Description
- `categoryId`: Catégorie
- `location`: Localisation
- `photo`: Chemin vers la photo (optionnel)
- `status`: Statut (NOUVEAU, PRIS_EN_CHARGE, etc.)
- `userId`: Créateur
- `agentId`: Agent assigné (optionnel)
- Relations: category, creator, agent, comments, history

### Comment
- `id`: Identifiant unique
- `content`: Contenu
- `isInternal`: Commentaire interne (agents uniquement)
- `reportId`: Signalement
- `userId`: Auteur
- Relations: report, user

### ReportHistory
- `id`: Identifiant unique
- `reportId`: Signalement
- `status`: Statut à ce moment
- `changedBy`: Utilisateur qui a changé
- `createdAt`: Date du changement
- Relations: report, user

## 🔐 Rôles et permissions

### CITOYEN
- ✅ Créer des signalements
- ✅ Voir ses propres signalements
- ✅ Modifier/supprimer ses signalements (statut NOUVEAU uniquement)
- ✅ Voir les commentaires publics

### AGENT
- ✅ Voir tous les signalements
- ✅ Prendre en charge un signalement
- ✅ Modifier le statut
- ✅ Ajouter des commentaires (publics et internes)

### ADMIN
- ✅ Toutes les permissions AGENT
- ✅ Gérer les utilisateurs (créer, modifier rôle, supprimer)
- ✅ Gérer les catégories
- ✅ Voir les statistiques

## 📊 Statuts des signalements

1. **NOUVEAU** : Signalement créé, non assigné
2. **PRIS_EN_CHARGE** : Assigné à un agent
3. **EN_COURS** : En cours de traitement
4. **EN_ATTENTE_INFORMATIONS** : Besoin d'informations supplémentaires
5. **RESOLU** : Problème résolu
6. **CLOS** : Fermé (final, non modifiable)
7. **REJETE** : Rejeté

## 🔄 Flux de travail

### Création d'un signalement (Citoyen)
1. Connexion → Dashboard
2. "Nouveau signalement"
3. Remplir le formulaire (titre, catégorie, localisation, description, photo)
4. Création → Statut: NOUVEAU

### Traitement (Agent)
1. Connexion → Liste des signalements
2. Voir un signalement
3. "Prendre en charge" → Statut: PRIS_EN_CHARGE
4. Mettre à jour le statut selon l'avancement
5. Ajouter des commentaires (publics ou internes)

### Administration (Admin)
1. Dashboard avec statistiques
2. Gestion des utilisateurs (créer, modifier rôle)
3. Gestion des catégories (créer, supprimer)

## 🎨 Technologies utilisées

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **TailwindCSS** : Styling
- **Prisma** : ORM pour PostgreSQL
- **NextAuth.js** : Authentification
- **bcryptjs** : Hashage des mots de passe
- **Zod** : Validation des données

## 📝 Notes de développement

- Les images sont stockées dans `public/uploads/` (local)
- Pour la production, migrer vers Supabase Storage ou Cloudinary
- L'historique est automatiquement créé lors des changements de statut
- Les commentaires internes ne sont visibles que par les agents/admins

