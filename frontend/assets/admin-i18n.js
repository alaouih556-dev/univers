/* Admin language switch (EN default / FR).
   The admin UI is written in English. In French mode, a MutationObserver translates every
   text node and label attribute as soon as it is rendered (before paint, so no flash),
   and remembers the English original so switching back is instant. */
(function () {
'use strict';
const KEY = 'luxor_admin_lang';
let lang = localStorage.getItem(KEY) === 'fr' ? 'fr' : 'en';

const FR = {
  // login / shell
  'Admin panel': 'Espace administration', 'Sign in to manage projects, clients and the catalog.': 'Connectez-vous pour gérer les projets, les clients et le catalogue.',
  'Email': 'E-mail', 'Password': 'Mot de passe', 'Show password': 'Afficher le mot de passe', 'Sign in': 'Se connecter', 'Signing in…': 'Connexion…',
  'Back to the website': 'Retour au site', 'Please enter your email and password.': 'Veuillez saisir votre e-mail et votre mot de passe.',
  'Incorrect email or password.': 'E-mail ou mot de passe incorrect.', 'This account is not confirmed yet.': 'Ce compte n’est pas encore confirmé.',
  'Too many attempts. Please try again in a few minutes.': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'Your session has expired. Please sign in again.': 'Votre session a expiré. Veuillez vous reconnecter.',
  'This account does not have admin access.': 'Ce compte n’a pas d’accès administrateur.',
  'Loading your data…': 'Chargement de vos données…', 'Could not load the data': 'Impossible de charger les données', 'Try again': 'Réessayer',
  'Admin unavailable': 'Administration indisponible',
  'The server cannot be reached. Check your connection and try again.': 'Le serveur est injoignable. Vérifiez votre connexion et réessayez.',
  'Server error, please try again.': 'Erreur du serveur, veuillez réessayer.', 'Not found.': 'Introuvable.', 'The request is too large.': 'La requête est trop volumineuse.',
  'This account is not allowed to do that.': 'Ce compte n’est pas autorisé à faire cela.', 'Invalid id.': 'Identifiant invalide.',
  'The payment cannot exceed the balance.': 'Le paiement ne peut pas dépasser le solde.', 'Enter a valid date.': 'Saisissez une date valide.',
  'Write a note first.': 'Écrivez d’abord une note.', 'This project is finished.': 'Ce projet est terminé.', 'Unknown step.': 'Étape inconnue.',
  'The photo must be 5 MB or less.': 'La photo doit faire 5 Mo maximum.', 'Open the website': 'Ouvrir le site', 'Notifications': 'Notifications', 'All caught up.': 'Rien de nouveau.',
  'Account menu': 'Menu du compte', 'Sign out': 'Se déconnecter', 'Admin sections': 'Sections de l’administration', 'Quick actions': 'Actions rapides',
  'Search projects': 'Rechercher des projets', 'Help': 'Aide', 'Switch to light mode': 'Passer en mode clair', 'Switch to dark mode': 'Passer en mode sombre',
  'Dashboard': 'Tableau de bord', 'Projects': 'Projets', 'Clients': 'Clients', 'Catalog': 'Catalogue', 'Payments': 'Paiements', 'Messages': 'Messages', 'Settings': 'Paramètres',
  'Close': 'Fermer', 'Cancel': 'Annuler', 'Delete': 'Supprimer', 'Edit': 'Modifier', 'Save': 'Enregistrer', 'Add': 'Ajouter', 'Open': 'Ouvrir', 'Saving…': 'Enregistrement…', 'Error': 'Erreur',
  // statuses & labels
  'All': 'Tous', 'Started': 'Démarré', 'In Progress': 'En cours', 'Finished': 'Terminé',
  'Catalog order': 'Commande catalogue', 'Custom-made': 'Sur mesure', 'Interior design': 'Architecture d’intérieur',
  'Design validated': 'Design validé', 'Materials ordered': 'Matériaux commandés', 'Fabrication': 'Fabrication', 'Finishing': 'Finitions', 'Delivery & installation': 'Livraison & installation',
  'Individual': 'Particulier', 'Company': 'Entreprise', 'Hotel': 'Hôtel', 'Office': 'Bureau', 'Riad': 'Riad', 'Clinic': 'Clinique', 'School': 'École', 'Restaurant': 'Restaurant',
  'Draft': 'Brouillon', 'Sent': 'Envoyé', 'Accepted': 'Accepté', 'Refused': 'Refusé',
  'Bank transfer': 'Virement bancaire', 'Cheque': 'Chèque', 'Card': 'Carte', 'Cash': 'Espèces',
  'Deposit': 'Acompte', 'Balance': 'Solde', 'Installment': 'Versement', 'Paid': 'Payé', 'Partially paid': 'Partiellement payé', 'Unpaid': 'Non payé', 'Fully paid': 'Entièrement payé',
  // dashboard
  'Filter projects by status': 'Filtrer les projets par statut', 'Full report': 'Rapport complet', 'Export': 'Exporter',
  'Project': 'Projet', 'Client': 'Client', 'Type': 'Type', 'Status': 'Statut', 'Amount due': 'Reste à payer', 'Start / delivery': 'Début / livraison',
  'No project matches your search.': 'Aucun projet ne correspond à votre recherche.', 'View details': 'Voir le détail',
  'Search a project or client…': 'Rechercher un projet ou un client…', 'Search a project or client': 'Rechercher un projet ou un client',
  'this month': 'ce mois-ci', 'vs last month': 'vs mois dernier', 'vs last year': 'vs l’an dernier', 'total projects': 'projets au total',
  'Completed clients': 'Clients servis', 'Clients with at least one finished project or order.': 'Clients avec au moins un projet ou une commande terminé(e).', 'See clients': 'Voir les clients',
  'Total amount due': 'Total restant dû', 'Money clients still owe on started and delivered projects.': 'Montants encore dus par les clients sur les projets démarrés et livrés.', 'See payments': 'Voir les paiements',
  'Projects in progress': 'Projets en cours', 'Projects currently in production. The ring shows their average completion.': 'Projets actuellement en production. L’anneau indique leur avancement moyen.', 'See projects': 'Voir les projets',
  'Projects started': 'Projets démarrés', 'New projects started this month.': 'Nouveaux projets démarrés ce mois-ci.',
  'Projects finished': 'Projets terminés', 'Finished projects out of all projects.': 'Projets terminés sur l’ensemble des projets.',
  'Monthly revenue': 'Chiffre d’affaires mensuel', 'Payments received each month, in MAD.': 'Paiements reçus chaque mois, en MAD.',
  'Projects by status': 'Projets par statut', 'All projects, by current status.': 'Tous les projets, par statut actuel.',
  'Past months': 'Mois passés', 'Current month': 'Mois en cours', 'Upcoming (last year)': 'À venir (l’an dernier)', 'Average': 'Moyenne', 'Last year': 'L’an dernier', 'Upcoming month': 'Mois à venir', 'Revenue': 'Chiffre d’affaires',
  'Ahead of plan': 'En avance', 'On track': 'Dans les temps', 'no delivery yet this month.': 'aucune livraison ce mois-ci pour le moment.',
  'Upcoming deliveries': 'Prochaines livraisons', 'Next delivery dates of projects not finished yet.': 'Prochaines dates de livraison des projets non terminés.', 'Nothing scheduled.': 'Rien de prévu.', 'today': 'aujourd’hui',
  'All projects': 'Tous les projets', 'finished': 'terminés', 'Univers — dashboard': 'Univers — tableau de bord',
  // project detail
  'Back to projects': 'Retour aux projets', 'Project not found': 'Projet introuvable', 'Project status': 'Statut du projet',
  'Furniture pieces': 'Pièces de mobilier', 'Material': 'Matière', 'Finish / colour': 'Finition / coloris', 'Dimensions': 'Dimensions',
  'Production steps': 'Étapes de production', 'Notes & progress': 'Notes & avancement', 'Add a progress update…': 'Ajouter une note d’avancement…', 'Progress update': 'Note d’avancement',
  'Update added to the timeline.': 'Note ajoutée à l’historique.', 'Changing the status updates the dashboard instantly.': 'Changer le statut met à jour le tableau de bord immédiatement.',
  'Dates': 'Dates', 'Start': 'Début', 'Expected delivery': 'Livraison prévue', 'Completed': 'Terminé',
  'Payment': 'Paiement', 'Total price': 'Prix total', 'Deposit (avance)': 'Acompte (avance)', 'Amount paid': 'Montant payé', 'Remaining': 'Reste',
  'Record a payment': 'Enregistrer un paiement', 'Amount (MAD)': 'Montant (MAD)', 'Amount in MAD': 'Montant en MAD', 'Payment date': 'Date du paiement', 'Payment method': 'Mode de paiement', 'Add payment': 'Ajouter le paiement',
  'No contact details yet.': 'Pas encore de coordonnées.', 'Billed': 'Facturé', 'Due': 'Dû',
  'Enter a valid amount.': 'Saisissez un montant valide.', 'The payment date cannot be in the future.': 'La date de paiement ne peut pas être dans le futur.', 'Unknown status.': 'Statut inconnu.',
  // clients & quotes
  'Clients & quotes': 'Clients & devis', 'New client': 'Nouveau client', 'Edit client': 'Modifier le client', 'Add client': 'Ajouter le client', 'Client updated.': 'Client mis à jour.', 'Delete client': 'Supprimer le client',
  'Search a client, city, email…': 'Rechercher un client, une ville, un e-mail…', 'Search clients': 'Rechercher des clients',
  'No client matches your search.': 'Aucun client ne correspond à votre recherche.', 'No clients yet.': 'Aucun client pour le moment.', 'Add your first client': 'Ajouter votre premier client', 'Add a client first.': 'Ajoutez d’abord un client.',
  'The client will be permanently deleted.': 'Le client sera définitivement supprimé.', 'Back to clients': 'Retour aux clients',
  'Name *': 'Nom *', 'Client type': 'Type de client', 'Phone': 'Téléphone', 'City': 'Ville', 'Address': 'Adresse', 'Person or company name': 'Nom de la personne ou de l’entreprise',
  'The client name is required.': 'Le nom du client est obligatoire.', 'Enter a valid email address.': 'Saisissez une adresse e-mail valide.', 'A client with this name already exists.': 'Un client porte déjà ce nom.', 'Client not found.': 'Client introuvable.',
  'Quotes': 'Devis', '(devis)': '', 'Quote': 'Devis', 'Filter quotes': 'Filtrer les devis', 'Number': 'Numéro', 'Subject': 'Objet', 'Date': 'Date', 'Valid until': 'Valable jusqu’au', 'Total (TTC)': 'Total (TTC)',
  'No quote with this status.': 'Aucun devis avec ce statut.', 'No quotes yet — use “New quote” on a client card.': 'Aucun devis pour le moment — utilisez « Nouveau devis » sur une fiche client.',
  'New quote': 'Nouveau devis', 'Edit quote': 'Modifier le devis', 'Create quote': 'Créer le devis', 'Save quote': 'Enregistrer le devis', 'Quote created as a draft.': 'Devis créé en brouillon.', 'Quote saved.': 'Devis enregistré.',
  'Client *': 'Client *', 'Valid for (days)': 'Validité (jours)', 'Description': 'Description', 'Qty': 'Qté', 'Quantity': 'Quantité', 'Unit price (MAD, excl. VAT)': 'Prix unitaire (MAD, HT)', 'Unit price': 'Prix unitaire', 'Line total': 'Total ligne',
  'Piece or service': 'Pièce ou prestation', 'Product or service': 'Produit ou prestation', 'Choose a catalog product or type a service': 'Choisissez un produit du catalogue ou saisissez une prestation', 'Description shown on the quote': 'Description affichée sur le devis', 'Remove photo': 'Retirer la photo', 'Categories': 'Catégories', '+ New category…': '+ Nouvelle catégorie…', 'Name of the new category (e.g. Luminaires)': 'Nom de la nouvelle catégorie (ex. Luminaires)',
  'New category name': 'Nom de la nouvelle catégorie', 'New category (e.g. Luminaires)': 'Nouvelle catégorie (ex. Luminaires)', 'Category name': 'Nom de la catégorie', 'Delete category': 'Supprimer la catégorie',
  'Move or delete its products first': 'Déplacez ou supprimez d’abord ses produits', 'Category renamed.': 'Catégorie renommée.',
  'Categories of the products on the website. A category can only be deleted when it has no products.': 'Catégories des produits du site. Une catégorie ne peut être supprimée que si elle n’a aucun produit.',
  'Enter the category name.': 'Saisissez le nom de la catégorie.', 'This category already exists.': 'Cette catégorie existe déjà.', 'Category not found.': 'Catégorie introuvable.', 'Keep at least one category.': 'Gardez au moins une catégorie.', 'From the catalog': 'Du catalogue', 'Other item': 'Autre article', 'Item source': 'Origine de l’article',
  'Choose a product…': 'Choisir un produit…', 'Loading the catalog…': 'Chargement du catalogue…', 'Catalog product': 'Produit du catalogue',
  'Item not in the catalog (e.g. custom piece, delivery)': 'Article hors catalogue (ex. pièce sur mesure, livraison)', 'Item not in the catalog (e.g. wood, fabric)': 'Article hors catalogue (ex. bois, tissu)',
  'From the catalog fills the photo, description, details and price. Other item is for anything not in the catalog.': '« Du catalogue » remplit la photo, la description, les détails et le prix. « Autre article » sert pour tout ce qui n’est pas au catalogue.', 'Tip: choose a catalog product to fill its photo, description, details and price.': 'Astuce : choisissez un produit du catalogue pour remplir sa photo, sa description, ses détails et son prix.', 'The database needs an update: run backend/supabase/quote_items_details.sql in Supabase.': 'La base de données doit être mise à jour : exécutez backend/supabase/quote_items_details.sql dans Supabase.', 'Price': 'Prix', 'Remove line': 'Supprimer la ligne', 'Add line': 'Ajouter une ligne',
  'Discount (%)': 'Remise (%)', 'Deposit / avance (%)': 'Acompte / avance (%)', 'Add VAT (TVA 20 %)': 'Ajouter la TVA (20 %)', 'Notes & conditions': 'Notes & conditions', 'Lead time, delivery, warranty…': 'Délai, livraison, garantie…',
  'e.g. Custom living room set': 'ex. Salon sur mesure', 'e.g. 220 × 90 × 75 cm': 'ex. 220 × 90 × 75 cm',
  'Subtotal (excl. VAT)': 'Sous-total (HT)', 'Net (excl. VAT)': 'Net (HT)', 'VAT 20%': 'TVA 20 %',
  'Add your company address, ICE and RC in': 'Ajoutez l’adresse, l’ICE et le RC de votre entreprise dans les', 'so they appear on the quote.': 'pour qu’ils figurent sur le devis.',
  'Choose a client.': 'Choisissez un client.', 'Add at least one line to the quote.': 'Ajoutez au moins une ligne au devis.', 'Every line needs a description.': 'Chaque ligne doit avoir une description.',
  'Every line needs a quantity above 0.': 'Chaque ligne doit avoir une quantité supérieure à 0.', 'Quote not found.': 'Devis introuvable.', 'Quote not found': 'Devis introuvable',
  'This quote is already a project and can no longer be edited.': 'Ce devis est déjà un projet et ne peut plus être modifié.',
  'Quote status': 'Statut du devis', 'Purchase order': 'Bon de commande', 'Purchase orders': 'Bons de commande', '(bons de commande)': '', 'New purchase order': 'Nouveau bon de commande',
  'Order status': 'Statut de la commande', 'Filter purchase orders': 'Filtrer les bons de commande', 'Confirmed': 'Confirmé', 'Delivered': 'Livré', 'Cancelled': 'Annulé',
  'Delivery date': 'Date de livraison', 'Delivery address': 'Adresse de livraison', 'Address where the order is delivered': 'Adresse où la commande est livrée', 'Delivery': 'Livraison',
  'Client ICE': 'ICE du client', 'For company clients': 'Pour les clients entreprises', 'Split': 'Diviser', 'Split this line in two (e.g. 3 black + 1 white)': 'Diviser cette ligne en deux (ex. 3 noires + 1 blanche)',
  'Purchase order created as a draft.': 'Bon de commande créé en brouillon.', 'Purchase order saved.': 'Bon de commande enregistré.', 'Create purchase order': 'Créer le bon de commande', 'Save purchase order': 'Enregistrer le bon de commande',
  'Delivery note': 'Bon de livraison', 'Invoice': 'Facture', 'Invoices': 'Factures', '(factures)': '', 'Issue the invoice': 'Émettre la facture', 'Issue the invoice?': 'Émettre la facture ?', 'Invoice issued.': 'Facture émise.', 'Create the invoice': 'Créer la facture', 'Invoice created.': 'Facture créée.', 'Download': 'Télécharger', 'Download PDF': 'Télécharger le PDF', 'Print': 'Imprimer',
  'PDF downloaded.': 'PDF téléchargé.', 'The PDF could not be created.': 'Le PDF n’a pas pu être créé.', 'The PDF tool could not be loaded. Use Print instead.': 'L’outil PDF n’a pas pu être chargé. Utilisez Imprimer.',
  'Client': 'Client', 'From quote': 'Issu du devis', 'Total (incl. VAT)': 'Total (TTC)', 'Paid': 'Payé', 'One-time step:': 'Étape unique :',
  'a Moroccan invoice must show your company ICE and IF. Enter them below — they are saved in Settings for all future invoices.': 'une facture marocaine doit indiquer l’ICE et l’IF de votre entreprise. Saisissez-les ci-dessous — ils sont enregistrés dans les Paramètres pour toutes les prochaines factures.',
  'Company ICE *': 'ICE de l’entreprise *', 'Company IF (identifiant fiscal) *': 'IF de l’entreprise (identifiant fiscal) *', '15 digits': '15 chiffres', 'Enter the company ICE and IF.': 'Saisissez l’ICE et l’IF de l’entreprise.',
  'The invoice gets the next number. Afterwards it cannot be changed or deleted, but you can download or print it at any time.': 'La facture reçoit le numéro suivant. Ensuite elle ne peut plus être modifiée ni supprimée, mais vous pouvez la télécharger ou l’imprimer à tout moment.',
  'Invoice not found': 'Facture introuvable', 'Issued from fully paid projects': 'Émises pour les projets entièrement payés', 'Project': 'Projet',
  'An invoice is a legal document: it cannot be changed or deleted.': 'Une facture est un document légal : elle ne peut être ni modifiée ni supprimée.',
  'No invoices yet — open a project: when the remaining amount is 0, use “Issue the invoice”.': 'Aucune facture pour le moment — ouvrez un projet : quand le reste à payer est à 0, utilisez « Émettre la facture ».',
  'This client has invoices: it cannot be deleted (invoices must be kept).': 'Ce client a des factures : il ne peut pas être supprimé (les factures doivent être conservées).',
  'The project is not fully paid yet: the invoice can be issued when the remaining amount is 0.': 'Le projet n’est pas encore entièrement payé : la facture peut être émise quand le reste à payer est à 0.',
  'Add your company ICE and IF (identifiant fiscal) in Settings before issuing an invoice.': 'Ajoutez l’ICE et l’IF (identifiant fiscal) de votre entreprise dans les Paramètres avant d’émettre une facture.',
  'The project has no price.': 'Le projet n’a pas de prix.', 'This project already has an invoice.': 'Ce projet a déjà une facture.',
  'The database needs an update: run backend/supabase/invoices.sql in Supabase.': 'La base de données doit être mise à jour : exécutez backend/supabase/invoices.sql dans Supabase.', 'Reception note': 'Bon de réception', 'Reception notes': 'Bons de réception', '(bons de réception)': '', 'New reception note': 'Nouveau bon de réception',
  'Reception status': 'Statut de la réception', 'Compliant': 'Conforme', 'Dispute': 'Litige', 'Not compliant': 'Non conforme', 'Damaged': 'Endommagé', 'Missing': 'Manquant',
  'Goods received from suppliers': 'Marchandises reçues des fournisseurs', 'Goods received from a supplier, checked on arrival. Internal document.': 'Marchandises reçues d’un fournisseur, contrôlées à l’arrivée. Document interne.',
  'Supplier *': 'Fournisseur *', 'Supplier': 'Fournisseur', 'Supplier company name': 'Nom de la société fournisseur', 'Supplier phone': 'Téléphone fournisseur', 'Supplier ICE': 'ICE fournisseur',
  'Supplier delivery note N°': 'N° du bon de livraison fournisseur', 'Supplier delivery note date': 'Date du bon de livraison fournisseur', "Number on the supplier's delivery note": 'Numéro inscrit sur le BL du fournisseur',
  'Supplier delivery note': 'BL fournisseur', 'Reception date': 'Date de réception', 'Received by': 'Reçu par', 'Person who checked the goods': 'Personne qui a contrôlé la marchandise',
  'For purchase order': 'Pour le bon de commande', 'For order': 'Pour commande', '— Stock / no order —': '— Stock / sans commande —', 'Reference': 'Référence', 'Ref.': 'Réf.',
  'Ordered': 'Commandé', 'Received': 'Reçu', 'Condition': 'État', 'Unit price (excl. VAT)': 'Prix unitaire (HT)', 'Amount': 'Montant', 'Item received': 'Article reçu',
  'Amount received (no VAT)': 'Montant reçu (sans TVA)', 'Amount (no VAT)': 'Montant (sans TVA)', 'Check': 'Contrôle', 'Remarks / reservations': 'Observations / réserves',
  'e.g. 2 boxes damaged, reported to the driver': 'ex. 2 cartons abîmés, signalés au livreur', 'Supplier reception': 'Réception fournisseur',
  'Create reception note': 'Créer le bon de réception', 'Save reception note': 'Enregistrer le bon de réception', 'Reception note created as a draft.': 'Bon de réception créé en brouillon.',
  'Reception note saved.': 'Bon de réception enregistré.', 'Reception note not found': 'Bon de réception introuvable', 'Reception note not found.': 'Bon de réception introuvable.',
  'Delete reception note': 'Supprimer le bon de réception', 'The reception note will be permanently deleted.': 'Le bon de réception sera définitivement supprimé.',
  'Reception note back to draft.': 'Bon de réception repassé en brouillon.', 'Reception validated: the supplier can be paid.': 'Réception validée : le fournisseur peut être payé.',
  'Reception marked as a dispute: supplier payment blocked.': 'Réception en litige : paiement du fournisseur bloqué.',
  'No reception notes yet — use “Reception note” on a client card when goods arrive from a supplier.': 'Aucun bon de réception pour le moment — utilisez « Bon de réception » sur une fiche client à l’arrivée d’une marchandise fournisseur.',
  'Goods received from suppliers, per client': 'Marchandises reçues des fournisseurs, par client', '— No purchase order —': '— Sans bon de commande —',
  'Enter the supplier name.': 'Saisissez le nom du fournisseur.', 'Add at least one received item.': 'Ajoutez au moins un article reçu.', 'The quantity ordered must be above 0.': 'La quantité commandée doit être supérieure à 0.',
  'Enter a valid quantity received.': 'Saisissez une quantité reçue valide.', 'This reception note is validated and can no longer be edited.': 'Ce bon de réception est validé et ne peut plus être modifié.',
  'Some items are missing, short or damaged: mark this reception as a dispute instead.': 'Des articles sont manquants, incomplets ou endommagés : passez plutôt cette réception en litige.',
  'The database needs an update: run backend/supabase/receipts.sql in Supabase.': 'La base de données doit être mise à jour : exécutez backend/supabase/receipts.sql dans Supabase.', 'Delivery notes': 'Bons de livraison', '(bons de livraison)': '', 'New delivery note': 'Nouveau bon de livraison',
  'Delivery status': 'Statut de la livraison', 'Delivered & signed': 'Livré et signé', 'Driver / carrier': 'Livreur / transporteur', 'e.g. Our team, or the transport company': 'ex. Notre équipe, ou la société de transport',
  'Item': 'Article', 'Ordered': 'Commandé', 'Delivered now': 'Livré maintenant', 'extra': 'en plus', 'Remarks / client reservations': 'Observations / réserves du client',
  'e.g. delivered and installed, one box damaged…': 'ex. livré et installé, un carton abîmé…', '— None (free delivery note) —': '— Aucun (bon de livraison libre) —',
  'Set 0 for items delivered later — they stay on the order.': 'Mettez 0 pour les articles livrés plus tard — ils restent sur la commande.',
  'Everything on this purchase order has already been delivered.': 'Tout ce bon de commande a déjà été livré.', 'Confirm the purchase order before delivering it.': 'Confirmez le bon de commande avant de le livrer.',
  'Create delivery note': 'Créer le bon de livraison', 'Save delivery note': 'Enregistrer le bon de livraison', 'Delivery note created as a draft.': 'Bon de livraison créé en brouillon.', 'Delivery note saved.': 'Bon de livraison enregistré.',
  'Delivery note not found': 'Bon de livraison introuvable', 'Delivery note not found.': 'Bon de livraison introuvable.', 'Delete delivery note': 'Supprimer le bon de livraison',
  'The delivery note will be permanently deleted. Its items count as not delivered again.': 'Le bon de livraison sera définitivement supprimé. Ses articles redeviennent « à livrer ».',
  'Delivery note marked as delivered and signed.': 'Bon de livraison marqué comme livré et signé.', 'Delivery note back to draft.': 'Bon de livraison repassé en brouillon.',
  'Everything on the purchase order is delivered: the order is now marked as delivered.': 'Tout le bon de commande est livré : la commande est maintenant marquée comme livrée.',
  'No delivery notes yet — open a confirmed purchase order and use “Delivery note”.': 'Aucun bon de livraison pour le moment — ouvrez un bon de commande confirmé et utilisez « Bon de livraison ».',
  'Purchase order *': 'Bon de commande *', 'This client has no confirmed purchase order left to deliver.': 'Ce client n’a aucun bon de commande confirmé à livrer.',
  'Choose the purchase order to deliver.': 'Choisissez le bon de commande à livrer.',
  'Deliver at least one item (quantity above 0).': 'Livrez au moins un article (quantité supérieure à 0).', 'The purchase order belongs to another client.': 'Le bon de commande appartient à un autre client.',
  'This purchase order is cancelled.': 'Ce bon de commande est annulé.', 'This delivery note is signed and can no longer be edited.': 'Ce bon de livraison est signé et ne peut plus être modifié.',
  'The database needs an update: run backend/supabase/deliveries.sql in Supabase.': 'La base de données doit être mise à jour : exécutez backend/supabase/deliveries.sql dans Supabase.', 'Purchase order not found': 'Bon de commande introuvable',
  'Delete purchase order': 'Supprimer le bon de commande', 'The purchase order will be permanently deleted.': 'Le bon de commande sera définitivement supprimé.',
  'This quote already has a purchase order': 'Ce devis a déjà un bon de commande', 'Create another one': 'En créer un autre',
  'No purchase order with this status.': 'Aucun bon de commande avec ce statut.', 'No purchase orders yet — use “Purchase order” on a client card or on a quote.': 'Aucun bon de commande pour le moment — utilisez « Bon de commande » sur une fiche client ou un devis.',
  'Order not found.': 'Bon de commande introuvable.', 'The quote belongs to another client.': 'Le devis appartient à un autre client.', 'Enter a valid delivery date.': 'Saisissez une date de livraison valide.',
  'The delivery date cannot be before the order date.': 'La date de livraison ne peut pas être avant la date de commande.', 'This order is delivered or cancelled and can no longer be edited.': 'Cette commande est livrée ou annulée et ne peut plus être modifiée.',
  'Add at least one line to the order.': 'Ajoutez au moins une ligne au bon de commande.', 'The database needs an update: run backend/supabase/orders.sql in Supabase.': 'La base de données doit être mise à jour : exécutez backend/supabase/orders.sql dans Supabase.', 'Open project': 'Ouvrir le projet', 'Print / PDF': 'Imprimer / PDF', 'Delete quote': 'Supprimer le devis',
  'The quote will be deleted. The project created from it is kept.': 'Le devis sera supprimé. Le projet créé à partir de celui-ci est conservé.', 'The quote will be permanently deleted.': 'Le devis sera définitivement supprimé.',
  'Accept this quote?': 'Accepter ce devis ?', 'Accept & create project': 'Accepter & créer le projet', 'Project created from the quote.': 'Projet créé à partir du devis.',
  // payments & messages
  'Received this month': 'Reçu ce mois-ci', 'Deposits this year': 'Acomptes cette année', 'Open balances': 'Soldes ouverts', 'No open balance. 🎉': 'Aucun solde ouvert. 🎉',
  'Payment history': 'Historique des paiements', 'Method': 'Mode', 'Amount': 'Montant', 'payment cannot exceed the balance': 'le paiement ne peut pas dépasser le solde',
  'Mark as unread': 'Marquer comme non lu', 'Marked as unread.': 'Marqué comme non lu.', 'Reply by email': 'Répondre par e-mail',
  // settings & help
  'Profile': 'Profil', 'Shown in the header avatar.': 'Affiché dans l’avatar de l’en-tête.', 'Display name': 'Nom affiché', 'Signed in as': 'Connecté en tant que', 'Profile saved.': 'Profil enregistré.',
  'Appearance': 'Apparence', 'Also available from the floating toolbar.': 'Aussi disponible depuis la barre d’outils flottante.', 'Theme': 'Thème', 'Light': 'Clair', 'Dark': 'Sombre', 'Language': 'Langue',
  'Change password': 'Changer le mot de passe', 'At least 10 characters.': 'Au moins 10 caractères.', 'New password': 'Nouveau mot de passe', 'Confirm': 'Confirmer', 'Update password': 'Mettre à jour le mot de passe',
  'Use at least 10 characters.': 'Utilisez au moins 10 caractères.', 'The two passwords do not match.': 'Les deux mots de passe ne correspondent pas.', 'Password updated.': 'Mot de passe mis à jour.',
  'Company details': 'Coordonnées de l’entreprise', 'Printed on your quotes (devis).': 'Imprimées sur vos devis.', 'Company name *': 'Nom de l’entreprise *', 'Tagline': 'Slogan', 'Website': 'Site web',
  'RIB (bank account)': 'RIB (compte bancaire)', 'Save company details': 'Enregistrer les coordonnées', 'Company details saved.': 'Coordonnées enregistrées.', 'The company name is required.': 'Le nom de l’entreprise est obligatoire.',
  'Sample data': 'Données d’exemple', 'The database still contains sample data:': 'La base contient encore des données d’exemple :', '(with their projects, payments and quotes) and': '(avec leurs projets, paiements et devis) et',
  '. Remove it when you start entering your real clients.': '. Supprimez-les quand vous commencez à saisir vos vrais clients.', 'Remove sample data': 'Supprimer les données d’exemple',
  'No sample data left — everything here is your real data.': 'Plus aucune donnée d’exemple — tout ici correspond à vos vraies données.',
  'Remove all sample data?': 'Supprimer toutes les données d’exemple ?', 'Sample data removed.': 'Données d’exemple supprimées.',
  'Sample clients and everything linked to them (projects, payments, quotes), sample messages and sample revenue history will be deleted from the database. Your own data is kept.': 'Les clients d’exemple et tout ce qui leur est lié (projets, paiements, devis), les messages d’exemple et l’historique de chiffre d’affaires d’exemple seront supprimés de la base. Vos propres données sont conservées.',
  '— key figures, charts and all projects. Use the status toggle to filter the table,': '— chiffres clés, graphiques et tous les projets. Utilisez le filtre de statut pour filtrer le tableau,', 'for a CSV and': 'pour un CSV et', 'to print or save as PDF.': 'pour imprimer ou enregistrer en PDF.',
  '— open': '— ouvrez', 'to change the status, tick production steps, record payments and add progress notes. Every change updates the dashboard instantly.': 'pour changer le statut, cocher les étapes de production, enregistrer des paiements et ajouter des notes. Chaque modification met à jour le tableau de bord immédiatement.',
  '— the products shown on the public website (live).': '— les produits affichés sur le site public (en direct).', 'Dark mode': 'Mode sombre', '— moon icon in the floating toolbar.': '— icône lune dans la barre d’outils flottante.',
  '— add, edit or delete clients and prepare quotes (devis). An accepted quote becomes a project in one click.': '— ajoutez, modifiez ou supprimez des clients et préparez des devis. Un devis accepté devient un projet en un clic.',
  'All data is stored in your Supabase database and visible only to admin accounts.': 'Toutes les données sont stockées dans votre base Supabase et visibles uniquement par les comptes administrateurs.',
  // catalog
  'Loading products…': 'Chargement des produits…', 'Products on the website': 'Produits sur le site', 'Products': 'Produits', 'Categories': 'Catégories', 'New arrivals': 'Nouveautés', 'Average price': 'Prix moyen',
  'Search a product or reference…': 'Rechercher un produit ou une référence…', 'Search products': 'Rechercher des produits', 'Filter by category': 'Filtrer par catégorie', 'All categories': 'Toutes les catégories',
  'Product': 'Produit', 'Category': 'Catégorie', 'Price (MAD)': 'Prix (MAD)', 'Price (MAD) *': 'Prix (MAD) *', 'Tags': 'Étiquettes', 'Actions': 'Actions', 'Reference': 'Référence',
  'No product matches your search.': 'Aucun produit ne correspond à votre recherche.', 'New': 'Nouveau', 'Featured': 'Mis en avant', 'View on the website': 'Voir sur le site', 'Save price': 'Enregistrer le prix', 'Enter a valid price.': 'Saisissez un prix valide.',
  'New product': 'Nouveau produit', 'Add a photo': 'Ajouter une photo', 'JPG, PNG or WebP': 'JPG, PNG ou WebP', 'Product name *': 'Nom du produit *', 'Colour': 'Coloris', 'New arrival': 'Nouveauté',
  'Without a photo, the category image is used.': 'Sans photo, l’image de la catégorie est utilisée.', 'Click the photo to replace it.': 'Cliquez sur la photo pour la remplacer.', 'Add product': 'Ajouter le produit',
  'The product name is required.': 'Le nom du produit est obligatoire.', 'The name is required.': 'Le nom est obligatoire.', 'Choose a JPG, PNG or WebP image.': 'Choisissez une image JPG, PNG ou WebP.', 'Unreadable image.': 'Image illisible.',
  'The product and its page will be removed from the website. This cannot be undone.': 'Le produit et sa page seront retirés du site. Cette action est irréversible.',
  'Could not create the product, please try again.': 'Impossible de créer le produit, veuillez réessayer.', 'Product not found or action not allowed.': 'Produit introuvable ou action non autorisée.'
};
const n = s => +s;
const pl = (k, one, many) => n(k) > 1 ? many : one;
/* Sentences built with numbers / names */
const RX = [
  [/^(\d+) projects? in progress$/, (_, a) => `${a} projet${pl(a, '', 's')} en cours`],
  [/^(\d+) projects · (.+) due$/, (_, a, b) => `${a} projet${pl(a, '', 's')} · ${b} restant${pl(a, '', 's')}`],
  [/^(\d+) clients · (\d+) open quotes$/, (_, a, b) => `${a} client${pl(a, '', 's')} · ${b} devis ouvert${pl(b, '', 's')}`],
  [/^(\d+) open balances?$/, (_, a) => `${a} solde${pl(a, '', 's')} ouvert${pl(a, '', 's')}`],
  [/^(\d+) payments$/, (_, a) => `${a} paiement${pl(a, '', 's')}`], [/^(\d+) unread$/, (_, a) => `${a} non lu${pl(a, '', 's')}`],
  [/^(\d+) clients$/, (_, a) => `${a} client${pl(a, '', 's')}`], [/^(\d+) messages$/, (_, a) => `${a} message${pl(a, '', 's')}`],
  [/^avg (.+)$/, (_, a) => `moy. ${a}`],
  [/^(Started|In Progress|Finished|finished): (.+)$/, (_, a, b) => `${FR[a]} : ${b}`],
  [/^of (\d+)$/, (_, a) => `sur ${a}`], [/^(\d+) of (\d+) projects finished$/, (_, a, b) => `${a} projets terminés sur ${b}`],
  [/^Finished (\d+)%$/, (_, a) => `Terminés ${a} %`], [/^Remaining (\d+)$/, (_, a) => `Restants ${a}`],
  [/^(\S+) (\d{4}), month to date$/, (_, a, b) => `${a} ${b}, mois en cours`],
  [/^(\d+) days late$/, (_, a) => `${a} jours de retard`], [/^in (\d+) days$/, (_, a) => `dans ${a} jours`],
  [/^(\d+) deliver(?:ies are|y is) overdue\.$/, (_, a) => `${a} livraison${pl(a, ' est', 's sont')} en retard.`],
  [/^(\d+) projects? delivered this month\.$/, (_, a) => `${a} projet${pl(a, ' livré', 's livrés')} ce mois-ci.`],
  [/^(Ahead of plan|On track), no delivery yet this month\.$/, (_, a) => `${FR[a]}, aucune livraison ce mois-ci pour le moment.`],
  [/^(Ahead of plan|On track), (\d+) projects? delivered this month\.$/, (_, a, b) => `${FR[a]}, ${b} projet${pl(b, ' livré', 's livrés')} ce mois-ci.`],
  [/^(\d+) deliver(?:ies are|y is) overdue\. (\d+) projects? delivered this month\.$/, (_, a, b) => `${a} livraison${pl(a, ' est', 's sont')} en retard. ${b} projet${pl(b, ' livré', 's livrés')} ce mois-ci.`],
  [/^\((\d+) items\)$/, (_, a) => `(${a} articles)`], [/^(\d+)% complete$/, (_, a) => `${a} % terminé`], [/^(\d+)% paid$/, (_, a) => `${a} % payé`], [/^Paid (\d+)%$/, (_, a) => `Payé ${a} %`],
  [/^Fill remaining \((.+)\)$/, (_, a) => `Compléter le reste (${a})`],
  [/^“(.+)” is now (.+)\.$/, (_, a, b) => `« ${a} » est maintenant : ${FR[b] || b}.`],
  [/^Price of “(.+)”: (.+)\.$/, (_, a, b) => `Prix de « ${a} » : ${b}.`],
  [/^Payment of (.+) recorded\.$/, (_, a) => `Paiement de ${a} enregistré.`],
  [/^Exported (\d+) projects? to CSV\.$/, (_, a) => `${a} projet${pl(a, ' exporté', 's exportés')} en CSV.`],
  [/^Client “(.+)” added\.$/, (_, a) => `Client « ${a} » ajouté.`], [/^Client “(.+)” deleted\.$/, (_, a) => `Client « ${a} » supprimé.`],
  [/^This will also permanently delete$/, () => 'Cela supprimera aussi définitivement'], [/^linked to this client\. This cannot be undone\.$/, () => 'liés à ce client. Cette action est irréversible.'],
  [/^\d+ (projects?|payments?|quotes?)\b(?!.* (due|open quotes|in progress|finished|delivered)).*$/, k => k.replace(/(\d+) projects?\b/, (_, a) => `${a} projet${pl(a, '', 's')}`).replace(/(\d+) payments?\b/, (_, a) => `${a} paiement${pl(a, '', 's')}`).replace(/(\d+) quotes?\b/, '$1 devis')],
  [/^ · expired$/, () => ' · expiré'], [/^Discount (\S+)%$/, (_, a) => `Remise ${a} %`], [/^Deposit (\S+)%$/, (_, a) => `Acompte ${a} %`], [/^Total incl\. VAT$/, () => 'Total TTC'],
  [/^Category “(.+)” (added|deleted)\.$/, (_, a, b) => `Catégorie « ${a} » ${b === 'added' ? 'ajoutée' : 'supprimée'}.`], [/^Delete the category “(.+)”\?$/, (_, a) => `Supprimer la catégorie « ${a} » ?`],
  [/^(\d+) products?$/, (_, a) => `${a} produit${pl(a, '', 's')}`],
  [/^This category still has (\d+) products?: move (?:them|it) to another category or delete (?:them|it) first\.$/, (_, a) => `Cette catégorie contient encore ${a} produit${pl(a, '', 's')} : déplacez-le${pl(a, '', 's')} vers une autre catégorie ou supprimez-le${pl(a, '', 's')} d’abord.`],
  [/^Invoice · (.*)$/, (_, a) => `Facture · ${a}`], [/^Invoice (FA-\S+)$/, (_, a) => `Facture ${a}`],
  [/^An invoice with the next number will be created for “(.+)” \((.+)\)\. It is a legal document: it cannot be changed or deleted afterwards\.$/, (_, a, b) => `Une facture portant le numéro suivant sera créée pour « ${a} » (${b}). C’est un document légal : elle ne pourra plus être modifiée ni supprimée.`],
  [/^Reception note · (.*)$/, (_, a) => `Bon de réception · ${a}`], [/^(\d+) reception notes?$/, (_, a) => `${a} bon${pl(a, '', 's')} de réception`], [/^Edit reception note (.+)$/, (_, a) => `Modifier le bon de réception ${a}`],
  [/^Delete reception note (.+)\?$/, (_, a) => `Supprimer le bon de réception ${a} ?`], [/^Reception note (\S+) deleted\.$/, (_, a) => `Bon de réception ${a} supprimé.`],
  [/^(\d+) reception notes?$/, (_, a) => `${a} bon${pl(a, '', 's')} de réception`], [/^Discount (\S+)%$/, (_, a) => `Remise ${a} %`],
  [/^Delivery note · (.*)$/, (_, a) => `Bon de livraison · ${a}`], [/^Edit delivery note (.+)$/, (_, a) => `Modifier le bon de livraison ${a}`],
  [/^Delete delivery note (.+)\?$/, (_, a) => `Supprimer le bon de livraison ${a} ?`], [/^Delivery note (\S+) deleted\.$/, (_, a) => `Bon de livraison ${a} supprimé.`],
  [/^(\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?) delivered$/, (_, a, b) => `${a} / ${b} livrés`], [/^· (\S+) already delivered$/, (_, a) => `· ${a} déjà livré(s)`],
  [/^(.+) is not on the purchase order\.$/, (_, a) => `${a} ne figure pas sur le bon de commande.`],
  [/^(.+): only (\S+) left to deliver\.$/, (_, a, b) => `${a} : il ne reste que ${b} à livrer.`], [/^(\d+) delivery notes?$/, (_, a) => `${a} bon${pl(a, '', 's')} de livraison`],
  [/^(\S+ · \S+ \S+ \S+ · )(\d+(?:\.\d+)?) items$/, (_, a, b) => `${a}${b} articles`],
  [/^Purchase order marked as (.+)\.$/, (_, a) => `Bon de commande marqué comme ${(FR[a[0].toUpperCase() + a.slice(1)] || a).toLowerCase()}.`],
  [/^Purchase order · (.*)$/, (_, a) => `Bon de commande · ${a}`], [/^Edit purchase order (.+)$/, (_, a) => `Modifier le bon de commande ${a}`], [/^Edit quote (.+)$/, (_, a) => `Modifier le devis ${a}`],
  [/^Delete purchase order (.+)\?$/, (_, a) => `Supprimer le bon de commande ${a} ?`], [/^Purchase order (\S+) deleted\.$/, (_, a) => `Bon de commande ${a} supprimé.`],
  [/^Purchase order (.+) already comes from this quote\.$/, (_, a) => `Le bon de commande ${a} provient déjà de ce devis.`], [/^Quote (DEV-\S+)$/, (_, a) => `Devis ${a}`],
  [/^From quote (\S*) — change quantities, colours or lines as the client wishes\. Use “Split” to divide a line \(e\.g\. 3 black \+ 1 white\)\.$/, (_, a) => `Issu du devis ${a} — modifiez les quantités, coloris ou lignes selon le souhait du client. Utilisez « Diviser » pour séparer une ligne (ex. 3 noires + 1 blanche).`],
  [/^(\d+) purchase orders?$/, (_, a) => `${a} bon${pl(a, '', 's')} de commande`],
  [/^Edit “(.+)”$/, (_, a) => `Modifier « ${a} »`], [/^Quote · (.*)$/, (_, a) => `Devis · ${a}`], [/^Quote marked as (.+)\.$/, (_, a) => `Devis marqué comme ${(FR[a[0].toUpperCase() + a.slice(1)] || a).toLowerCase()}.`],
  [/^Delete quote (.+)\?$/, (_, a) => `Supprimer le devis ${a} ?`], [/^Quote (\S+) deleted\.$/, (_, a) => `Devis ${a} supprimé.`],
  [/^The quote will be marked as accepted and a new project “(.+)” \((.+)\) will be created for (.*)\.$/, (_, a, b, c) => `Le devis sera marqué comme accepté et un nouveau projet « ${a} » (${b}) sera créé pour ${c}.`],
  [/^“(.+)” was added to the catalog\.$/, (_, a) => `« ${a} » a été ajouté au catalogue.`], [/^“(.+)” was updated\.$/, (_, a) => `« ${a} » a été mis à jour.`], [/^“(.+)” was deleted\.$/, (_, a) => `« ${a} » a été supprimé.`],
  [/^Edit “(.+)”$/, (_, a) => `Modifier « ${a} »`],
  [/^(.+) — delivery overdue by (\d+) days?$/, (_, a, b) => `${a} — livraison en retard de ${b} jour${pl(b, '', 's')}`],
  [/^(.+) — delivery in (\d+) days?$/, (_, a, b) => `${a} — livraison dans ${b} jour${pl(b, '', 's')}`],
  [/^(.+): (.+) still due on “(.+)”$/, (_, a, b, c) => `${a} : ${b} encore dus sur « ${c} »`],
  [/^Quote (\S+) has expired$/, (_, a) => `Le devis ${a} a expiré`], [/^Quote (\S+) expires in (-?\d+) days?$/, (_, a, b) => `Le devis ${a} expire dans ${b} jour${pl(b, '', 's')}`],
  [/^(\d+) unread messages?$/, (_, a) => `${a} message${pl(a, '', 's')} non lu${pl(a, '', 's')}`],
  [/^(.+) (completed|reopened)\.$/, (_, a, b) => FR[a] ? `${FR[a]} : ${b === 'completed' ? 'terminé' : 'rouverte'}.` : _],
  [/^(Deposit|Balance|Payment) received — (.+) \((.+)\)\.$/, (_, a, b, c) => `${{ Deposit: 'Acompte', Balance: 'Solde', Payment: 'Paiement' }[a]} reçu — ${b} (${FR[c] || c}).`],
  [/^(\d+)% average completion$/, (_, a) => `${a} % d’avancement moyen`], [/^(\d+) of (\d+) projects finished$/, (_, a, b) => `${a} projets terminés sur ${b}`],
  [/^Sign-in failed \((.+)\)$/, (_, a) => `Échec de la connexion (${a})`],
  [/^.+ · .+$/, k => k.split(' · ').map(x => tx(x)).join(' · ')],
  [/^(.+) — Univers admin$/, (_, a) => `${FR[a] || a} — Admin Univers`]
];
/* Only for labels (aria-label, title…), never for visible text that may be a client/product name */
const RX_ATTR = [[/^Edit “(.+)”$/, (_, a) => `Modifier « ${a} »`], [/^Edit (.+)$/, (_, a) => `Modifier ${a}`], [/^Delete (.+)$/, (_, a) => `Supprimer ${a}`], [/^Price of (.+)$/, (_, a) => `Prix de ${a}`]];
function tx(s, attr = false) {
  const k = s.trim(); if (!k) return s;
  let r = FR[k];
  if (r == null) for (const [re, f] of attr ? RX.concat(RX_ATTR) : RX) if (re.test(k)) { r = k.replace(re, f); break; }
  return r == null || r === k ? s : s.replace(k, r);
}
const ATTRS = ['aria-label', 'placeholder', 'title', 'alt', 'data-tip', 'data-l'];
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA']);
const textRec = new WeakMap(), attrRec = new WeakMap();
const skip = el => !el || SKIP.has(el.nodeName) || el.isContentEditable || el.closest?.('[translate="no"],.quote-doc');

function trText(node) {
  const p = node.parentElement; if (skip(p)) return;
  const rec = textRec.get(node), v = node.nodeValue;
  if (rec && rec.fr === v) return;                 // already ours
  const out = tx(v); if (out === v) return;
  // <option> without value submits its text: keep the English value for the form
  if (p.nodeName === 'OPTION' && !p.hasAttribute('value')) p.setAttribute('value', v.trim());
  textRec.set(node, { en: v, fr: out }); node.nodeValue = out;
}
function trAttrs(el) {
  if (!el || el.closest?.('[translate="no"],.quote-doc')) return;   // labels/placeholders of text areas are translated too
  for (const a of ATTRS) {
    const v = el.getAttribute(a); if (!v) continue;
    const rec = attrRec.get(el) || {};
    if (rec[a] && rec[a].fr === v) continue;
    const out = tx(v, true); if (out === v) continue;
    rec[a] = { en: v, fr: out }; attrRec.set(el, rec); el.setAttribute(a, out);
  }
}
function translate(root) {
  if (root.nodeType === 3) return trText(root);
  if (root.nodeType !== 1) return;
  trAttrs(root); root.querySelectorAll('*').forEach(trAttrs);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) trText(t);
}
function restore(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) { const r = textRec.get(t); if (r && t.nodeValue === r.fr) t.nodeValue = r.en; }
  root.querySelectorAll('*').forEach(el => { const rec = attrRec.get(el); if (!rec) return; for (const a in rec) if (el.getAttribute(a) === rec[a].fr) el.setAttribute(a, rec[a].en); });
}
const mo = new MutationObserver(list => {
  if (lang !== 'fr') return;
  for (const m of list) {
    if (m.type === 'childList') m.addedNodes.forEach(translate);
    else if (m.type === 'characterData') trText(m.target);
    else if (m.type === 'attributes') trAttrs(m.target);
  }
});
mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

function apply() {
  document.documentElement.lang = lang;
  if (lang === 'fr') translate(document.documentElement); else restore(document.documentElement);
}
apply();

window.LuxorI18n = {
  get lang() { return lang; },
  /* locale for numbers and dates */
  get locale() { return lang === 'fr' ? 'fr-FR' : 'en-GB'; },
  get numLocale() { return lang === 'fr' ? 'fr-FR' : 'en-US'; },
  set(l) { if (l === lang) return; lang = l === 'fr' ? 'fr' : 'en'; localStorage.setItem(KEY, lang); apply(); dispatchEvent(new CustomEvent('luxor-lang', { detail: lang })); },
  toggle() { this.set(lang === 'fr' ? 'en' : 'fr'); },
  t: str => lang === 'fr' ? tx(str) : str   // for texts the page cannot show itself (e.g. browser confirm dialogs)
};
})();
