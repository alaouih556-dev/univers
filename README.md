# Luxor Creation — Nouvelle Maison

**Projet neuf**, sans reprise du HTML/CSS des anciennes versions. Frontend statique uniquement, inspiré des codes de navigation des catalogues de mobilier de luxe. Les photos d'ambiance du site ont été générées pour ce prototype et intégrées localement. Les fiches produits utilisent aussi des URL Unsplash à titre illustratif, avec image de remplacement locale si la connexion échoue.

## Démarrage Windows

1. Extraire l'archive ZIP, puis ouvrir PowerShell dans le dossier `udc-nouvelle-maison`.
2. Exécuter `node backend/server.js` depuis la racine du projet (Node.js 18 ou plus, aucune installation npm nécessaire).
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

## Administration (`/admin/`) — Supabase

Produits, catégories, couleurs et photos sont stockés dans **Supabase** (projet `oknbuexbsukrzycwiies`). Le site lit le catalogue en direct : une modification faite dans `/admin/` est visible immédiatement, sans redéploiement ni variable Vercel.

- Connexion : comptes **Supabase Auth** listés dans la table `admins` (aujourd'hui `adminluxor@gmail.com`). Changer le mot de passe : Supabase → Authentication → Users.
- Ajouter un administrateur : créer l'utilisateur dans Authentication, puis `insert into public.admins(user_id,email) select id,email from auth.users where email='…';`
- Sécurité : règles RLS (lecture publique, écriture réservée aux admins), photos dans le bucket `products` (5 Mo max).
- `frontend/` contient l'URL et la clé *publishable* Supabase : elles sont publiques par conception. Les clés secrètes restent dans `.env` (jamais commité ni déployé).
- `backend/supabase/schema.sql` crée tables et règles ; `seed.sql` importe `frontend/assets/catalogue.json` (secours si Supabase est indisponible).

## Structure

```
frontend/              le site (seul dossier publié par Vercel, voir vercel.json)
  index.html, catalogue/, produit/, …   pages HTML
  admin/               page d'administration
  assets/site.css      design · assets/site.js rendu et interactions
  assets/admin.*       interface d'administration
  assets/catalogue.json données du catalogue · assets/*.webp visuels
backend/
  server.js            serveur local d'aperçu (node backend/server.js)
  supabase/schema.sql  tables, règles de sécurité, stockage photos
  supabase/seed.sql    import du catalogue
vercel.json            publie frontend/ ; /produit/<slug>/ inconnu → frontend/produit/index.html
```

Pour seulement afficher le site : `python -m http.server 8080 --directory frontend`.
