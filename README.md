# Luxor Creation — Nouvelle Maison

**Projet neuf**, sans reprise du HTML/CSS des anciennes versions. Frontend statique uniquement, inspiré des codes de navigation des catalogues de mobilier de luxe. Les photos d'ambiance du site ont été générées pour ce prototype et intégrées localement. Les fiches produits utilisent aussi des URL Unsplash à titre illustratif, avec image de remplacement locale si la connexion échoue.

## Démarrage Windows

1. Extraire l'archive ZIP, puis ouvrir PowerShell dans le dossier `udc-nouvelle-maison`.
2. Exécuter `node backend/server.js` depuis la racine du projet (Node.js 18 ou plus, aucune installation npm nécessaire).
3. Ouvrir `http://localhost:8080/` — l'administration est sur `http://localhost:8080/admin/`, l'API sur `http://localhost:8080/api/`.
   Le serveur lit `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans le fichier `.env` à la racine.
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

## Administration (`/admin/`) — Supabase

Produits, catégories, couleurs et photos sont stockés dans **Supabase** (projet `oknbuexbsukrzycwiies`). Le site lit le catalogue en direct : une modification faite dans `/admin/` est visible immédiatement, sans redéploiement ni variable Vercel.

- Connexion : comptes **Supabase Auth** listés dans la table `admins` (aujourd'hui `adminluxor@gmail.com`). Changer le mot de passe : Supabase → Authentication → Users.
- Ajouter un administrateur : créer l'utilisateur dans Authentication, puis `insert into public.admins(user_id,email) select id,email from auth.users where email='…';`
- Sécurité : règles RLS (lecture publique, écriture réservée aux admins), photos dans le bucket `products` (5 Mo max).
- `frontend/` ne contient plus aucune adresse ni clé Supabase : le site et l'admin appellent uniquement l'API `/api`. La connexion Supabase est dans `backend/` (variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`). Les clés secrètes restent dans `.env` (jamais commité ni déployé) ; la clé *service role* n'est pas utilisée par l'API.
- `backend/supabase/schema.sql` crée tables et règles ; `seed.sql` importe `frontend/assets/catalogue.json` (secours si Supabase est indisponible).

## Données de l'administration (Supabase)

Clients, projets (pièces, étapes, historique), paiements, messages, devis et historique de chiffre d'affaires sont dans Supabase, **visibles uniquement par les administrateurs** (RLS).

- `backend/supabase/admin_schema.sql` : tables + règles métier côté base (numérotation des devis `DEV-AAAA-NNN`, paiement refusé s'il dépasse le reste à payer, historique automatique des changements de statut, `convert_quote()` qui transforme un devis accepté en projet, coordonnées de l'entreprise imprimées sur les devis).
- `backend/supabase/quote_items_details.sql` : photo, description, dimensions, matière et coloris sur chaque ligne de devis.
- `backend/supabase/orders.sql` : **bons de commande** (`BC-AAAA-NNN`). Créés depuis une fiche client ou depuis un devis (lignes reprises puis modifiables : quantités, coloris, bouton « Diviser » pour transformer 4 tables noires en 3 noires + 1 blanche). Statuts : brouillon, confirmé, livré, annulé (livré/annulé = verrouillé). Document imprimable : adresse et date de livraison, ICE client, coloris par ligne, acompte et reste à payer, double signature (client « Bon pour commande » + cachet de l'entreprise).
- `backend/supabase/deliveries.sql` : **bons de livraison** (`BL-AAAA-NNN`), sans prix. Toujours basés sur un bon de commande confirmé (bouton sur le bon de commande, ou sur la fiche client qui propose ses bons de commande à livrer) ; les lignes sont celles du bon de commande, pré-remplies avec le reste à livrer. Livraisons partielles possibles (ex. 3 tables noires aujourd'hui, la blanche plus tard) : chaque ligne ne peut pas dépasser le reste à livrer. Quand tout est livré sur des bons signés, le bon de commande passe automatiquement à « livré ». Document : quantités commandée / livrée / reste à livrer, observations et réserves du client, signatures du livreur et du client.
- `backend/supabase/admin_seed.sql` : données d'exemple (marquées `sample`), supprimables depuis Admin → Settings → « Remove sample data ».

## Frontend / backend

Le **frontend** (`frontend/`) ne fait qu'afficher : il appelle l'**API backend** (`backend/`), qui seule parle à Supabase.

- `GET /api/catalog` — catalogue public du site (si Supabase est injoignable, l'API renvoie `frontend/assets/catalogue.json`).
- `POST /api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/password` — connexion admin.
- `/api/admin/…` — données et actions de l'administration (projets, paiements, clients, devis, entreprise, produits et photos). Chaque appel vérifie que l'utilisateur est bien dans `admins`, valide les données puis écrit dans Supabase **avec le jeton de l'admin**, donc les règles RLS s'appliquent toujours. Liste complète en tête de `backend/src/app.js`.

En ligne, Vercel publie `frontend/` en statique et `api/index.js` comme fonction serverless (même domaine, voir `vercel.json`). Pour héberger l'API ailleurs, définir `window.LUXOR_API = 'https://…/api'` avant le chargement des scripts.

Variables Vercel (Settings → Environment Variables) : `SUPABASE_URL` et `SUPABASE_ANON_KEY`. Sans elles, l'API utilise l'adresse et la clé publique du projet actuel.

## Structure

```
frontend/              le site (seul dossier publié par Vercel, voir vercel.json)
  index.html, catalogue/, produit/, …   pages HTML
  admin/               page d'administration
  assets/site.css      design · assets/site.js rendu et interactions
  assets/admin.*       interface d'administration
  assets/catalogue.json données du catalogue · assets/*.webp visuels
backend/
  server.js            serveur local : frontend/ + API (node backend/server.js)
  src/app.js           routes de l'API /api/…
  src/auth.js          connexion admin (Supabase Auth)
  src/catalog.js       catalogue public + gestion des produits et photos
  src/admin.js         clients, projets, paiements, devis, entreprise : validations et règles
  src/supabase.js      accès Supabase (URL et clé lues dans l'environnement)
  supabase/schema.sql  tables, règles de sécurité, stockage photos
  supabase/seed.sql    import du catalogue
api/index.js           point d'entrée Vercel de l'API (réutilise backend/src/app.js)
vercel.json            publie frontend/ ; /api/* → API ; /produit/<slug>/ inconnu → frontend/produit/index.html
```

Pour seulement afficher le site sans l'API : `python -m http.server 8080 --directory frontend` (le catalogue utilise alors `catalogue.json`, l'administration ne fonctionne pas).
