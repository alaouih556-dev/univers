# Univers Design Creation — Nouvelle Maison

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

- Connexion par email et mot de passe. Le mot de passe est stocké **haché** (scrypt) dans `.admin.json`, jamais en clair ni envoyé au navigateur.
- Changer les identifiants : `node server.js --set-admin <email> <mot de passe>` puis redémarrer le serveur.
- Fonctions : ajouter un produit (avec photo), modifier le prix directement dans la liste, modifier nom / catégorie / description / matière / dimensions / couleur / photo, supprimer un produit.
- Les modifications sont enregistrées dans `assets/catalogue.json` (copie de sauvegarde automatique dans `.backups/`), les photos dans `assets/uploads/`, et la page `produit/<slug>/` est créée ou supprimée automatiquement.
- Protection : session HttpOnly de 8 h, blocage 15 min après 5 mots de passe erronés, requêtes d'autres sites refusées. En ligne, servir le site en **HTTPS**.
- `python -m http.server` affiche toujours le site, mais l'administration nécessite `node server.js`.

## Structure

- `index.html` et chaque sous-dossier : page HTML directe
- `assets/site.css` : design complet
- `assets/site.js` : rendu et interactions
- `assets/catalogue.json` : données du catalogue
- `assets/*.webp` : visuels locaux

Le serveur `python -m http.server` fournit directement chaque répertoire ; aucune compilation npm n'est nécessaire.
