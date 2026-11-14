# Luxor Design Creation — Nouvelle Maison

**Projet neuf**, sans reprise du HTML/CSS des anciennes versions. Frontend statique uniquement, inspiré des codes de navigation des catalogues de mobilier de luxe. Les photos d'ambiance du site ont été générées pour ce prototype et intégrées localement. Les fiches produits utilisent aussi des URL Unsplash à titre illustratif, avec image de remplacement locale si la connexion échoue.

## Démarrage Windows

1. Extraire l'archive ZIP, puis ouvrir PowerShell dans le dossier `udc-nouvelle-maison`.
2. Exécuter `node server.js` (Node.js 18 ou plus, aucune installation npm nécessaire).
3. Ouvrir `http://localhost:8080/` — l'administration est sur `http://localhost:8080/admin/`.
4. Ne pas lancer le site en double-cliquant sur les fichiers HTML car le catalogue JSON est chargé par `fetch`.

Si le port 8080 est déjà utilisé, choisir `8090` et ouvrir `http://localhost:8090/`.

## Pages et fonctions

- Page d'accueil photographique avec carrousel, catégories, nouveautés, fabrication sur mesure, inspirations et 3D
- 48 produits de démonstration et 9 catégories avec URL dédiée
- 48 fiches produits HTML avec galerie, miniatures, zoom au survol et plein écran
- 6 inspirations éditoriales avec page individuelle, 4 collections et leurs fiches
- Pages fabrication coussins, canapés et meubles, espace 3D « bientôt disponible »
- Filtres catalogue par prix, matière, texte, catégorie et tri
- 6 échantillons de couleur. La sélection de couleur affiche un **dessin de simulation du même type de meuble**, et non une photographie colorisée certifiée
- Favoris en localStorage, Admin DEMO local (ajout / suppression), formulaire de devis non envoyé
- Aucune authentification, aucun paiement et aucun backend

## Limites importantes

La présentation est originale et **n'est pas une copie 100 % du site Roche Bobois**. Le catalogue et les images sont fictifs / illustratifs, destinés à être remplacés avec le catalogue autorisé ou les photos de l'entreprise. Les vues de détail sont des illustrations d'ambiance et ne doivent pas être présentées comme différentes photographies authentiques d'un même modèle. L'interface d'administration n'est pas sécurisée et ne convient pas à la production. Les prix et dimensions sont des données de démonstration. Les images locales continuent de fonctionner hors ligne ; pour les images secondaires Unsplash, une connexion internet améliore la diversité.

## Administration (`/admin/`)

Ajouter / supprimer des produits, modifier prix, description, photo… Le mot de passe n'est jamais dans le code du navigateur.

### En ligne (Vercel)

L'API est la fonction serverless `api/admin.js`. Chaque modification devient un **commit GitHub**, puis Vercel redéploie le site (≈ 1 min).

Variables à créer dans Vercel → Settings → Environment Variables (puis *Redeploy*) :

| Variable | Valeur |
|---|---|
| `ADMIN_EMAIL` | email de connexion |
| `ADMIN_PASSWORD_HASH` | obtenu avec `node server.js --hash "<mot de passe>"` |
| `SESSION_SECRET` | donné par la même commande |
| `GITHUB_TOKEN` | jeton GitHub *fine-grained*, dépôt du site uniquement, permission **Contents : Read and write** |
| `GITHUB_REPO` | `propriétaire/dépôt` |
| `GITHUB_BRANCH` | facultatif (`main` par défaut) |

### En local

`node server.js` → `http://localhost:8080/admin/`. Identifiants locaux : `node server.js --set-admin <email> <mot de passe>` (fichier `.admin.json`, haché, jamais commité ni déployé). Les modifications sont écrites directement dans les fichiers (sauvegardes dans `.backups/`).

Protection : session signée HttpOnly de 8 h, blocage après 5 mots de passe erronés, requêtes d'autres sites refusées.

## Structure

- `index.html` et chaque sous-dossier : page HTML directe
- `assets/site.css` : design complet
- `assets/site.js` : rendu et interactions
- `assets/catalogue.json` : données du catalogue
- `assets/*.webp` : visuels locaux

Le serveur `python -m http.server` fournit directement chaque répertoire ; aucune compilation npm n'est nécessaire.
