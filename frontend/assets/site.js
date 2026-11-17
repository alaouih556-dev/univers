(async function(){
'use strict';
const cfg=window.UDC||{base:'./',kind:'home'},root=cfg.base;
/* ---------- Language (FR default / EN) ----------
   The site is written in French; EN maps each French text to English.
   tr() translates rendered text nodes + attributes, t() is for strings built in code. */
let LANG=localStorage.getItem('udc_lang')==='en'?'en':'fr';
const EN={
 // header, menus, drawer
 'Contenu principal':'Main content','Menu':'Menu','Fermer':'Close','Rechercher':'Search','Mes favoris':'My favourites','Mon espace':'My account','Showrooms':'Showrooms','Retour':'Back','Produits':'Products','Collections':'Collections','Le Mag':'The Mag','Sur mesure':'Made to measure','Contact':'Contact','Séjour':'Living room','Cuisine':'Kitchen','Chambre':'Bedroom','Rangements':'Storage','Outdoor':'Outdoor','Décoration':'Decoration','Canapés':'Sofas','Fauteuils':'Armchairs','Coussins':'Cushions','Coussins & textile':'Cushions & textiles','Cuisines sur mesure':'Custom kitchens','Tables':'Tables','Tables de repas':'Dining tables','Chaises':'Chairs','Chaises, tabourets et bancs':'Chairs, stools and benches','Buffets, consoles et bibliothèques':'Sideboards, consoles and bookcases','Lits & chambres':'Beds & bedrooms','Outdoor / mobilier d’extérieur':'Outdoor furniture','Canapés, fauteuils et tables outdoor':'Outdoor sofas, armchairs and tables','Luminaires, miroirs et objets':'Lighting, mirrors and objects','Autres catégories':'Other categories','Luminaires':'Lighting','Tapis':'Rugs','Tout le catalogue':'Full catalogue','Demander un devis':'Request a quote','À la une':'Featured','Créations Automne-Hiver 2026':'Autumn-Winter 2026 creations','Découvrir':'Discover','Explorer':'Explore','À propos':'About','Nos Luxor':'Our Luxor','Cuisines':'Kitchens','Boutique déco':'Decor shop','Catalogue':'Catalogue','Service client':'Customer service','Service conseil en décoration':'Interior design advice','Nous contacter':'Contact us','Projets professionnels':'Professional projects','Guide d’entretien':'Care guide','Conditions de garantie':'Warranty terms','Confidentialité':'Privacy','Mentions légales':'Legal notice','Administration DEMO':'DEMO administration','Voir tous les produits':'See all products','Toutes les collections':'All collections','Notre savoir-faire':'Our craftsmanship','Canapés sur mesure':'Custom sofas','Coussins sur mesure':'Custom cushions','Meubles sur mesure':'Custom furniture','Le showroom':'The showroom','Recherche':'Search','Que recherchez-vous ?':'What are you looking for?','Les suggestions s’adaptent à votre recherche.':'Suggestions adapt to your search.','Aucun résultat.':'No results.','Accueil - Luxor Création':'Home - Luxor Création','Langue':'Language','Couleur':'Colour','Vue':'View','Diapositive':'Slide',
 // footer
 'Services':'Services','Livraison et installation':'Delivery and installation','Professionnels':'Professionals','Projets contract':'Contract projects','Architectes & décorateurs':'Architects & designers','Administration':'Administration','Marque':'Brand','Visualisation 3D':'3D visualisation','Recevez par mail les dernières actualités et les offres d’Luxor Creation':'Get the latest news and offers from Luxor Creation by email','Votre adresse email (nom@domaine.com)':'Your email address (name@domain.com)','Adresse email':'Email address','S’inscrire':'Subscribe','Suivez-nous sur :':'Follow us on:','En vous inscrivant, vous acceptez de recevoir nos propositions par e-mail et acceptez nos':'By subscribing, you agree to receive our offers by email and accept our','conditions d’utilisation':'terms of use','et notre':'and our','politique de confidentialité':'privacy policy','Luxor Creation : le design et l’':'Luxor Creation: Moroccan design and the ','art de vivre':'art of living',' marocain.':'.','Dans notre showroom au Maroc, Luxor Creation propose des collections originales, une fabrication sur mesure et un haut niveau de personnalisation. Découvrez nos canapés, fauteuils, tables basses, tables de repas, chaises, rangements, lits, luminaires, coussins et objets de décoration, façonnés pour composer des intérieurs singuliers.':'In our showroom in Morocco, Luxor Creation offers original collections, made-to-measure manufacturing and a high level of personalisation. Discover our sofas, armchairs, coffee tables, dining tables, chairs, storage, beds, lighting, cushions and decorative objects, crafted to create unique interiors.','Frontend de démonstration — prix, modèles et coordonnées illustratifs jusqu’à validation.':'Demo frontend — prices, models and contact details are illustrative until validated.','Trouver notre showroom Luxor Création sur Google Maps (nouvel onglet)':'Find our Luxor Création showroom on Google Maps (new tab)','Trouver notre showroom':'Find our showroom','Tous les showrooms':'All showrooms','Charte de confidentialité':'Privacy charter','Mentions légales et conditions d’utilisation du site':'Legal notice and terms of use','Politique d’accessibilité numérique':'Digital accessibility policy','Changer de pays':'Change country','Maroc':'Morocco','Haut de page':'Back to top','Merci ! Inscription enregistrée en démonstration (aucun envoi réel).':'Thank you! Subscription saved in demo mode (nothing is actually sent).',
 // shared blocks
 'Tout voir':'See all','Nouveauté':'New','Ajouter aux favoris':'Add to favourites','À partir de':'From','Précédent':'Previous','Suivant':'Next','Mobilier contemporain':'Contemporary furniture','Image agrandie':'Enlarged image',
 // home
 '12-30 NOV':'12-30 NOV','Des prix exceptionnels dans toutes les collections.':'Exceptional prices across all collections.','Trouvez votre showroom':'Find your showroom','Nouveautés':'New arrivals','Créations':'Autumn-Winter','Automne-Hiver 2026':'2026 creations','Le catalogue':'The catalogue','Feuilletez':'Browse','toutes nos pièces':'all our pieces','Voir le catalogue':'View the catalogue','Service conseil':'Design advice','Nos décorateurs':'Our designers','vous accompagnent':'are here to help','Prendre rendez-vous':'Book an appointment','Savoir-faire':'Craftsmanship','Fabrication':'Made-to-measure','sur mesure':'manufacturing','Découvrir l’atelier':'Discover the workshop','Salon contemporain, design Atelier Luxor':'Contemporary living room, design Atelier Luxor','Terrasse méditerranéenne':'Mediterranean terrace','Le détail textile':'The textile detail','Chambre sérénité':'Serenity bedroom','L’atelier 2026':'The 2026 workshop','design Atelier Luxor':'design Atelier Luxor','en savoir +':'learn more','Pause':'Pause','Lecture':'Play','Salon contemporain aux tons verts et naturels':'Contemporary living room in green and natural tones','Avant / Après : terrasse réalisée par Luxor Création':'Before / After: terrace by Luxor Création','Après : terrasse aménagée par Luxor Création, salon ouvert, cheminée et bassin à cascade':'After: terrace designed by Luxor Création, open lounge, fireplace and cascade pool','Avant : la terrasse en chantier':'Before: the terrace under construction','Avant':'Before','Après':'After','Comparer avant et après':'Compare before and after','Sérénité':'Sérénité',
 // page heads
 'Fil d’Ariane':'Breadcrumb','Accueil':'Home',
 // catalogue
 'Section précédente':'Previous section','Section suivante':'Next section','Tous':'All','Chaises & tabourets':'Chairs & stools','Mobilier d’extérieur':'Outdoor furniture','Objets & luminaires':'Objects & lighting','Aucun produit dans cette catégorie pour le moment.':'No products in this category yet.','Chambres':'Bedrooms','Extérieur':'Outdoor',
 'Le confort dans toutes ses expressions.':'Comfort in all its forms.','Des lignes singulières pour chaque espace.':'Distinctive lines for every space.','La rencontre de la matière et du dessin.':'Where material meets design.','Le repos comme un art de vivre.':'Rest as an art of living.','Textiles et confort réalisés sur mesure.':'Made-to-measure textiles and comfort.','L’assise réinventée.':'Seating reinvented.','L’équilibre entre élégance et fonction.':'The balance between elegance and function.','Des détails qui donnent du caractère.':'Details that add character.','La maison se prolonge dehors.':'The home extends outdoors.','Des cuisines sur mesure, pensées au millimètre pour votre intérieur.':'Custom kitchens, designed to the millimetre for your home.',
 // product types, colours, materials
 'Canapé':'Sofa','Fauteuil':'Armchair','Table':'Table','Lit':'Bed','Coussin':'Cushion','Chaise':'Chair','Rangement':'Storage','Objet de décoration':'Decorative object','Ivoire':'Ivory','Cognac':'Cognac','Taupe':'Taupe','Sauge':'Sage','Charbon':'Charcoal','Sable':'Sand',
 'Bois naturel':'Natural wood','Cuir et acier':'Leather and steel','Laque mate vert olive et LED intégrée':'Matte olive-green lacquer and built-in LED','Laque mate vert sauge et granit noir':'Matte sage-green lacquer and black granite','Laque vert sauge texturée et granit noir':'Textured sage-green lacquer and black granite','Laque vert sauge, marbre Calacatta et noyer':'Sage-green lacquer, Calacatta marble and walnut','Lin et bois':'Linen and wood','Marbre Calacatta or et laque vert sauge':'Calacatta gold marble and sage-green lacquer','Placage chêne fumé et marbre':'Smoked oak veneer and marble','Tissu texturé':'Textured fabric','Velours et métal':'Velvet and metal','À préciser':'To be confirmed',
 // product page
 'Produit introuvable':'Product not found','Ce produit de démonstration n’est plus disponible.':'This demo product is no longer available.','Image précédente':'Previous image','Image suivante':'Next image','Survoler pour zoomer · cliquer pour agrandir':'Hover to zoom · click to enlarge','Toucher pour agrandir':'Tap to enlarge','Galerie d’illustration. Les vues secondaires ne sont pas des photographies certifiées du même modèle.':'Illustrative gallery. Secondary views are not certified photographs of the same model.','Réf.':'Ref.','Coloris :':'Colour:','Le dernier visuel est une simulation du même modèle : choisir un coloris met à jour ce visuel.':'The last image is a simulation of the same model: choosing a colour updates it.','♥ Dans les favoris':'♥ In favourites','♡ Ajouter aux favoris':'♡ Add to favourites','Voir ce produit en showroom':'See this product in the showroom','Description':'Description','Dimensions':'Dimensions','Matières & entretien':'Materials & care','Matières':'Materials','Référence':'Reference','Livraison & services':'Delivery & services','Livraison, disponibilité et tarifs : à confirmer auprès de l’entreprise. Site vitrine de démonstration sans commande ni paiement.':'Delivery, availability and prices: to be confirmed with the company. Demo showcase site with no ordering or payment.','Vous aimerez aussi':'You may also like','APERÇU DE COLORIS • SIMULATION GRAPHIQUE':'COLOUR PREVIEW • GRAPHIC SIMULATION',
 ', une pièce à l\'équilibre subtil entre confort, lignes et matières. Une création présentée pour inspirer votre intérieur.':', a piece with a subtle balance of comfort, lines and materials. A creation presented to inspire your interior.',
 'Colonne de rangement en laque mate vert olive, four et micro-ondes encastrés, niche éclairée en LED pour la vaisselle et les épices.':'Tall storage unit in matte olive-green lacquer, built-in oven and microwave, LED-lit niche for dishes and spices.','Cuisine d’angle ouverte sur le jardin, façades vert sauge texturées, évier double et éclairage sous meubles.':'Corner kitchen opening onto the garden, textured sage-green fronts, double sink and under-cabinet lighting.','Cuisine en L vert sauge avec colonnes réfrigérateur, angle ouvert éclairé et lignes de tiroirs sans poignée.':'L-shaped sage-green kitchen with fridge columns, lit open corner and handleless drawer lines.','Cuisine en U avec îlot en marbre, colonnes intégrées et habillage mural en noyer : notre composition la plus complète.':'U-shaped kitchen with marble island, integrated columns and walnut wall panelling: our most complete composition.','Cuisine en U en laque vert sauge, poignées intégrées, étagères ouvertes rétroéclairées et plan de travail en granit noir.':'U-shaped kitchen in sage-green lacquer, integrated handles, backlit open shelves and black granite worktop.','Cuisine linéaire toute hauteur en placage chêne fumé, crédence fenêtre éclairée et plan de travail en marbre veiné.':'Full-height linear kitchen in smoked oak veneer, lit window splashback and veined marble worktop.','Îlot central en marbre veiné or, colonnes vert sauge et rangements éclairés : une cuisine pensée pour recevoir.':'Central island in gold-veined marble, sage-green columns and lit storage: a kitchen designed for entertaining.',
 // collections / inspirations / services / 3D
 'Collection':'Collection','La collection':'The collection','Un dialogue de textures et de matières.':'A dialogue of textures and materials.','Nos collections':'Our collections','Quatre Luxor de création, quatre manières de composer votre intérieur.':'Four Luxor creations, four ways to compose your interior.','Inspiration introuvable':'Inspiration not found','Vivre un espace autrement.':'Living a space differently.','Nos inspirations sont des exemples de composition et de style. Explorez les pièces de mobilier correspondant à cette ambiance.':'Our inspirations are examples of composition and style. Explore the furniture pieces that match this mood.','Les pièces de cette ambiance':'Pieces from this mood','Le Mag Luxor':'The Luxor Mag','Des ambiances et idées d’aménagement pour composer votre intérieur.':'Moods and layout ideas to compose your interior.','Inspiration':'Inspiration','Salon contemporain':'Contemporary living room','Un salon lumineux où les courbes s’expriment librement.':'A bright living room where curves express themselves freely.','Des textiles délicats et une atmosphère apaisante.':'Delicate textiles and a soothing atmosphere.','L’art de recevoir':'The art of entertaining','Des matières naturelles autour d’une grande table.':'Natural materials around a large table.','Esprit matière':'Material spirit','Bois, fibres, étoffes : le charme des textures.':'Wood, fibres, fabrics: the charm of textures.','La vie à l’extérieur, simplement.':'Outdoor living, simply.','Coussins, revêtements et savoir-faire.':'Cushions, upholstery and craftsmanship.',
 'Les détails qui changent tout.':'The details that change everything.','Un canapé pensé pour votre intérieur.':'A sofa designed for your interior.','La liberté de composer selon votre espace.':'The freedom to design around your space.','Création personnelle':'Personal creation','À votre mesure':'Made for you','Choix des tissus, du confort, des dimensions et des finitions. Imaginez votre projet avec notre équipe, du premier dessin au devis personnalisé.':'Choice of fabrics, comfort, dimensions and finishes. Imagine your project with our team, from the first sketch to a personalised quote.','Décrire mon projet':'Describe my project','Fabrication sur mesure':'Made-to-measure manufacturing','Un atelier pour les coussins, les canapés et les meubles personnalisés.':'A workshop for custom cushions, sofas and furniture.','Un nouveau moyen de se projeter dans votre intérieur.':'A new way to picture your interior.','Bientôt disponible':'Coming soon','Imaginez avant de réaliser':'Imagine before you build','Notre futur espace 3D vous permettra d’explorer des ambiances et des associations de mobilier. Pour le moment, les photographies sont des exemples fixes, pas un configurateur interactif.':'Our upcoming 3D space will let you explore moods and furniture combinations. For now, the photos are fixed examples, not an interactive configurator.','Explorer le catalogue':'Explore the catalogue',
 // forms
 'Contactez-nous':'Contact us','Pour discuter de mobilier et de fabrication sur mesure. Formulaire de démonstration : aucun message n’est envoyé.':'To discuss furniture and made-to-measure manufacturing. Demo form: no message is sent.','Ce formulaire est une démonstration frontend. Les informations saisies ne sont pas transmises à l’entreprise.':'This form is a frontend demo. The information entered is not sent to the company.','Nom et prénom *':'Full name *','Téléphone *':'Phone *','Ville':'City','Objet':'Subject','Demande de devis':'Quote request','Fabrication de coussins':'Cushion making','Fabrication de canapé':'Sofa making','Fabrication de meubles':'Furniture making','Dimensions souhaitées':'Desired dimensions','Votre projet':'Your project','Décrivez votre projet...':'Describe your project...','Envoyer ma demande':'Send my request','Formulaire DEMO validé localement. Pour envoyer de vraies demandes, il faudra connecter un backend ou un canal de contact.':'DEMO form validated locally. To send real requests, a backend or contact channel must be connected.','Produit :':'Product:',
 'Retrouvez les pièces enregistrées dans ce navigateur.':'Find the pieces saved in this browser.','Vous n’avez pas encore ajouté de favoris.':'You haven’t added any favourites yet.','Découvrir les produits':'Discover the products',
 // misc
 'Erreur de chargement':'Loading error','Le catalogue est momentanément indisponible. Veuillez réessayer.':'The catalogue is temporarily unavailable. Please try again.','Luxor Creation — Mobilier & Design':'Luxor Creation — Furniture & Design'
};
const t=s=>LANG==='en'&&EN[s]!=null?EN[s]:s;
const tDesc=p=>{const d=String(p?.description??'');if(LANG!=='en')return d;if(EN[d])return EN[d];const n=p?.name||'';return d.startsWith(n)&&EN[d.slice(n.length)]?n+EN[d.slice(n.length)]:d};
function tr(el){if(LANG!=='en'||!el)return;
 const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const v=n.nodeValue,k=v.trim();if(k&&EN[k]!=null&&EN[k]!==k)n.nodeValue=v.replace(k,EN[k]);else if(EN[v]!=null)n.nodeValue=EN[v]}
 el.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(e=>{for(const a of ['aria-label','placeholder','title','alt']){const v=e.getAttribute(a);if(v&&EN[v]!=null)e.setAttribute(a,EN[v])}})}
const TITLE_FR=document.title,DESC_FR=document.querySelector('meta[name="description"]')?.getAttribute('content')||'';
function applyLangMeta(){document.documentElement.lang=LANG;document.title=t(TITLE_FR);document.querySelector('meta[name="description"]')?.setAttribute('content',LANG==='en'?'Discover the furniture catalogue, inspirations and made-to-measure manufacturing of Luxor Creation.':DESC_FR)}
applyLangMeta();
/* Switch language in place (no reload, no blank page): re-render with the data already loaded */
function setLang(l){LANG=l;localStorage.setItem('udc_lang',l);applyLangMeta();const y=scrollY;init();scrollTo({top:y,behavior:'instant'});
 const app=document.getElementById('app');app.classList.remove('lang-fade');void app.offsetWidth;app.classList.add('lang-fade');document.getElementById('langsw')?.focus({preventScroll:true})}
/* Catalogue: from the backend API (/api/catalog), local catalogue.json as a fallback if the API is unreachable.
   window.LUXOR_API can point to another API origin (e.g. https://api.example.com/api). */
const API=(window.LUXOR_API||'/api').replace(/\/+$/,'');
async function loadDb(){const r=await fetch(API+'/catalog',{cache:'no-cache'});if(!r.ok)throw Error('API '+r.status);return r.json()}
let db;try{db=await loadDb()}catch(e){console.warn('API indisponible, catalogue local utilisé',e);try{let r=await fetch(root+'assets/catalogue.json',{cache:'no-cache'});if(!r.ok)throw Error('Données catalogue inaccessibles');db=await r.json()}catch(e2){document.getElementById('app').innerHTML='<div style="padding:5rem;font-family:Lato,Arial"><h1>'+t('Erreur de chargement')+'</h1><p>'+t('Le catalogue est momentanément indisponible. Veuillez réessayer.')+'</p></div>';console.error(e2);return}}
const C=db.categories,P=db.products,colors=db.colors,h=s=>root+s,esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('fr-MA').format(n)+' DH';
const isUrl=n=>/^https?:\/\//.test(n||'');
const fallback=p=>isUrl(p?.fallback)?p.fallback:h('assets/'+(p?.fallback||'hero-ivoire.webp'));
const picture=(src,fall='',klass='',alt='Mobilier contemporain')=>`<img class="${klass}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(fall||h('assets/hero-ivoire.webp'))}'">`;
const local=n=>isUrl(n)?n:h('assets/'+n);
const purl=p=>p.slug.startsWith('demo-')?h('produit/demo/')+'?id='+encodeURIComponent(p.slug):h('produit/'+p.slug+'/');
let fav=JSON.parse(localStorage.getItem('udc_fav_v3')||'[]');let custom=JSON.parse(localStorage.getItem('udc_products_v3')||'[]');let hidden=JSON.parse(localStorage.getItem('udc_hidden_v3')||'[]');
function all(){return P}
const collNames=['Signature','Horizon','Naturae','Atelier'];
const collOf=p=>collNames[Math.floor(Math.max(0,P.indexOf(p))/6)%4];
const typeName={canapes:'Canapé',fauteuils:'Fauteuil',tables:'Table',chambres:'Lit',coussins:'Coussin',chaises:'Chaise',rangements:'Rangement',decoration:'Objet de décoration',exterieur:'Mobilier d’extérieur',cuisines:'Cuisine'};
const catName=id=>C.find(c=>c.id===id)?.name||id;

/* ---------- Icons ---------- */
const I={
 menu:'<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
 pin:'<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/></svg>',
 heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
 user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5.5 20.5v-1.2c0-2.6 2.1-4.6 4.6-4.6h3.8c2.5 0 4.6 2 4.6 4.6v1.2z"/></svg>',
 close:'<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/></svg>',
 prev:'<svg viewBox="0 0 24 24"><path d="M15 4 7 12l8 8"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="m9 4 8 8-8 8"/></svg>',
 pause:'<svg viewBox="0 0 24 24" class="fill"><rect x="6" y="4.5" width="3.6" height="15"/><rect x="14.4" y="4.5" width="3.6" height="15"/></svg>',
 play:'<svg viewBox="0 0 24 24" class="fill"><path d="M7 4.5v15l12-7.5z"/></svg>',
 top:'<svg viewBox="0 0 24 24"><path d="m6 12.5 6-6 6 6M6 18l6-6 6 6"/></svg>',
 ig:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.9" cy="7.1" r=".5"/></svg>',
 fb:'<svg viewBox="0 0 24 24"><path d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.5c0-.8.3-1.4 1.4-1.4h1.5V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2H8.2V13h2.4v7z"/></svg>',
 pi:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M11.2 8.6c2.8-.9 5 .6 4.6 3-.4 2-2.3 3-3.8 2.2M11.8 10.2 9.7 19.5"/></svg>',
 yt:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="m10.2 9.4 4.6 2.6-4.6 2.6z"/></svg>',
 li:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8.3 10.5V16M8.3 7.8v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.2-2.6s2 .8 2 2.4V16"/></svg>',
 tt:'<svg viewBox="0 0 24 24"><path d="M13.5 4v10.3a2.9 2.9 0 1 1-2.9-2.9M13.5 4c.3 2.2 1.8 3.7 4 3.9"/></svg>'
};
const MAPS_URL='https://maps.app.goo.gl/a7R7iuoCFBifyNRA8';
const logo=(cls='')=>`<a class="logo ${cls}" href="${h('')}" aria-label="Accueil - Luxor Création"><img class="logo-full" src="${local('luxor-logo-gold.webp')}" alt="Luxor Création" width="900" height="781"><img class="logo-compact" src="${local('luxor-logo-compact.webp')}" alt="" aria-hidden="true" width="900" height="657"></a>`;

/* ---------- Navigation data ---------- */
const menuCols=[
 [['Séjour',[['canapes','Canapés'],['fauteuils','Fauteuils'],['coussins','Coussins & textile']]],['Cuisine',[['cuisines','Cuisines sur mesure'],['tables','Tables de repas'],['chaises','Chaises, tabourets et bancs']]],['Rangements',[['rangements','Buffets, consoles et bibliothèques']]]],
 [['Chambre',[['chambres','Lits & chambres']]],['Outdoor / mobilier d’extérieur',[['exterieur','Canapés, fauteuils et tables outdoor']]],['Décoration',[['decoration','Luminaires, miroirs et objets']]]]
];
/* Products panel levels: [label, url] for links, [label, null, levelId] for sub-levels */
const pmLevels={
 root:{title:'Menu',items:[['Collections','collections/'],['Produits',null,'produits'],['Le Mag','inspirations/'],['Sur mesure','fabrication-sur-mesure/'],['Showrooms','contact/'],['Contact','demander-un-devis/']]},
 produits:{title:'Produits',parent:'root',items:[['Séjour',null,'sejour'],['Cuisine',null,'salle'],['Chambre','catalogue/chambres/'],['Rangements','catalogue/rangements/'],['Outdoor','catalogue/exterieur/'],['Décoration','catalogue/decoration/']]},
 sejour:{title:'Séjour',parent:'produits',items:[['Canapés','catalogue/canapes/'],['Fauteuils','catalogue/fauteuils/'],['Coussins','catalogue/coussins/']]},
 salle:{title:'Cuisine',parent:'produits',items:[['Cuisines sur mesure','catalogue/cuisines/'],['Tables','catalogue/tables/'],['Chaises','catalogue/chaises/']]}
};
const roomOf={canapes:'sejour',fauteuils:'sejour',coussins:'sejour',tables:'salle',chaises:'salle',cuisines:'salle'};
/* Menus follow the categories managed in the admin: deleted categories are hidden,
   categories added later are listed under "Autres catégories" (drawer, mega menu and products panel). */
{const ids=new Set(C.map(c=>c.id)),catOf=u=>(/^catalogue\/([^/]+)\/$/.exec(u||'')||[])[1];
 for(let i=0;i<menuCols.length;i++){menuCols[i].forEach(g=>{g[1]=g[1].filter(([id])=>ids.has(id))});menuCols[i]=menuCols[i].filter(g=>g[1].length)}
 for(const l of Object.values(pmLevels))l.items=l.items.filter(([,u])=>!catOf(u)||ids.has(catOf(u)));
 for(const [k,l] of Object.entries(pmLevels))if(k!=='root'&&k!=='produits'&&!l.items.length){pmLevels.produits.items=pmLevels.produits.items.filter(it=>it[2]!==k);delete pmLevels[k]}
 const listed=new Set(menuCols.flat().flatMap(([,items])=>items.map(([id])=>id))),extra=C.filter(c=>!listed.has(c.id));
 if(extra.length){
  (menuCols[menuCols.length-1]||(menuCols[0]=[])).push(['Autres catégories',extra.map(c=>[c.id,c.name])]);
  const links=extra.map(c=>[c.name,'catalogue/'+c.id+'/']);
  if(links.length>2){pmLevels.autres={title:'Autres catégories',parent:'produits',items:links};pmLevels.produits.items.push(['Autres catégories',null,'autres']);extra.forEach(c=>{roomOf[c.id]='autres'})}
  else pmLevels.produits.items.push(...links)}}
function currentPath(){const k=cfg.kind;if(k.startsWith('category:'))return 'catalogue/'+k.slice(9)+'/';if(k.startsWith('product:')){const p=P.find(x=>x.slug===k.slice(8));return p?'catalogue/'+p.category+'/':''}return {catalogue:'catalogue/',collections:'collections/',inspirations:'inspirations/',services:'fabrication-sur-mesure/','3d':'visualisation-3d/',contact:'contact/',quote:'demander-un-devis/'}[k.split(':')[0]]||(k.startsWith('collection:')?'collections/':k.startsWith('inspiration:')?'inspirations/':k.startsWith('service:')?'fabrication-sur-mesure/':'')}
function pmenu(){
 const cur=currentPath(),curCat=cur.startsWith('catalogue/')?cur.split('/')[1]:'';
 const isActive=(id,[,u,sub])=>u?u===cur:(sub==='produits'?!!curCat:sub===roomOf[curCat]);
 const item=(id,it,i)=>{const [label,u,sub]=it;const inner=`<span class="pm-mask"><span class="pm-txt">${label}</span></span>`;const cls=`pm-item${isActive(id,it)?' active':''}`;return `<li style="--i:${i}">${u?`<a class="${cls}" href="${h(u)}">${inner}</a>`:`<button class="${cls}" data-pm="${sub}">${inner}</button>`}</li>`};
 return `<div class="pmenu" id="mega" aria-hidden="true" role="dialog" aria-label="Produits">
 <div class="pm-dim" data-pmclose></div>
 <div class="pm-panel">
  <div class="pm-top"><button class="pm-back" id="pmback" aria-label="Retour"><svg viewBox="0 0 24 24"><path d="M21 12H3.5M9.5 5.5 3 12l6.5 6.5"/></svg><span id="pmbacklbl">Produits</span></button><button class="pm-close" id="megaclose" data-pmclose><span>Fermer</span><svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20"/></svg></button></div>
  <div class="pm-levels">${Object.entries(pmLevels).map(([id,l])=>`<ul class="pm-list" data-level="${id}">${l.items.map((it,i)=>item(id,it,i)).join('')}</ul>`).join('')}</div>
  <div class="pm-foot"><a href="${h('catalogue/')}">Tout le catalogue</a><a href="${h('favoris/')}">Mes favoris</a><a href="${h('demander-un-devis/')}">Demander un devis</a></div>
 </div>
</div>`}

/* ---------- Header, mega panel, drawer, search ---------- */
function nav(){
 const groupHTML=([g,items])=>`<div class="mega-group"><h4>${g}</h4>${items.map(([id,n])=>`<a href="${h('catalogue/'+id+'/')}">${n}</a>`).join('')}</div>`;
 const arr='<svg class="dr-arr" viewBox="0 0 24 24"><path d="M4 12h15M14 6.5l5.5 5.5-5.5 5.5"/></svg>',back='<svg class="dr-arr" viewBox="0 0 24 24"><path d="M20 12H5M10 6.5 4.5 12l5.5 5.5"/></svg>';
 return `<a class="skip" href="#main">Contenu principal</a>
<header class="header" id="header">
 <div class="hdr-left">
  <button class="hdr-btn" id="openmenu" aria-expanded="false" aria-controls="drawer"><span class="when-closed">${I.menu}<span class="lbl">Menu</span></span><span class="when-open">${I.close}<span class="lbl">Fermer</span></span></button>
  <button class="hdr-btn" id="searchopen" aria-controls="searchmodal">${I.search}<span class="lbl">Rechercher</span></button>
 </div>
 ${logo()}
 <div class="hdr-right">
  <div class="hdr-icons"><a href="${h('favoris/')}" aria-label="Mes favoris">${I.heart}<em class="fav-count" id="favcount">${fav.length||''}</em></a><a href="${h('demander-un-devis/')}" aria-label="Mon espace">${I.user}</a><button class="lang-sw" id="langsw" aria-label="${LANG==='en'?'Passer en français':'Switch to English'}"><span class="${LANG==='fr'?'on':''}">FR</span><span class="${LANG==='en'?'on':''}">EN</span></button></div>
  <div class="hdr-links"><a class="hdr-link" href="${h('contact/')}">Showrooms</a></div>
 </div>
</header>
${pmenu()}
<div class="overlay" id="overlay"></div>
<aside class="drawer" id="drawer" aria-label="Menu">
 <div class="drawer-level" data-level="main">
  <a class="dr-feature" href="${h('collections/signature/')}" style="--i:0"><img src="${local('hero-salon-beige.webp')}" alt="" loading="lazy"><span class="dr-feature-txt"><small>À la une</small><b>Créations Automne-Hiver 2026</b><em>Découvrir ${arr}</em></span></a>
  <p class="dr-label" style="--i:1">Explorer</p>
  <nav class="dr-main">
   <button data-open="produits" style="--i:2"><span>Produits</span>${arr}</button>
   <button data-open="collections" style="--i:3"><span>Collections</span>${arr}</button>
   <a href="${h('inspirations/')}" style="--i:4"><span>Le Mag</span></a>
   <a href="${h('fabrication-sur-mesure/')}" style="--i:5"><span>Sur mesure</span></a>
   <a href="${h('contact/')}" style="--i:6"><span>Showrooms</span></a>
   <button data-open="apropos" style="--i:7"><span>À propos</span>${arr}</button>
  </nav>
  <p class="dr-label" style="--i:9">Nos Luxor</p>
  <div class="dr-chips" style="--i:10"><a href="${h('collections/horizon/')}">Horizon</a><a href="${h('collections/naturae/')}">Naturae</a><a href="${h('catalogue/cuisines/')}">Cuisines</a><a href="${h('catalogue/decoration/')}">Boutique déco</a><a href="${h('catalogue/')}">Catalogue</a></div>
  <p class="dr-label" style="--i:11">Service client</p>
  <div class="dr-list" style="--i:12">
   <a href="${h('demander-un-devis/')}">Service conseil en décoration</a>
   <a href="${h('contact/')}">Nous contacter</a>
   <a href="${h('favoris/')}">Mes favoris</a>
   <a href="${h('sur-mesure/meubles/')}">Projets professionnels</a>
  </div>
  <a class="dr-cta" href="${h('demander-un-devis/')}" style="--i:13"><span>Demander un devis</span>${arr}</a>
  <div class="dr-social" style="--i:14">${[['ig','Instagram'],['fb','Facebook'],['pi','Pinterest'],['yt','YouTube']].map(([k,n])=>`<a href="#" aria-label="${n}">${I[k]}</a>`).join('')}</div>
  <div class="dr-legal" style="--i:15"><a href="#">Guide d’entretien</a><a href="#">Conditions de garantie</a><a href="#">Confidentialité</a><a href="#">Mentions légales</a><a href="${h('admin/')}">Administration DEMO</a></div>
 </div>
 <div class="drawer-level sub" data-level="produits"><button class="dr-back" data-back>${back}<span>Retour</span></button><p class="dr-title">Produits</p>${menuCols.flat().map(groupHTML).join('')}<a class="dr-cta" href="${h('catalogue/')}"><span>Voir tous les produits</span>${arr}</a></div>
 <div class="drawer-level sub" data-level="collections"><button class="dr-back" data-back>${back}<span>Retour</span></button><p class="dr-title">Collections</p><div class="mega-group">${collNames.map(n=>`<a href="${h('collections/'+n.toLowerCase()+'/')}">${n}</a>`).join('')}</div><a class="dr-cta" href="${h('collections/')}"><span>Toutes les collections</span>${arr}</a></div>
 <div class="drawer-level sub" data-level="apropos"><button class="dr-back" data-back>${back}<span>Retour</span></button><p class="dr-title">À propos</p><div class="mega-group"><a href="${h('fabrication-sur-mesure/')}">Notre savoir-faire</a><a href="${h('sur-mesure/canapes/')}">Canapés sur mesure</a><a href="${h('sur-mesure/coussins/')}">Coussins sur mesure</a><a href="${h('sur-mesure/meubles/')}">Meubles sur mesure</a><a href="${h('contact/')}">Le showroom</a></div></div>
</aside>
<div class="search-panel" id="searchmodal" role="dialog" aria-label="Recherche"><div class="search-inner"><div class="search-row">${I.search}<input placeholder="Que recherchez-vous ?" id="globalsearch" autocomplete="off"><button class="hdr-btn" id="searchclose" aria-label="Fermer">${I.close}</button></div><p class="search-hint">Les suggestions s’adaptent à votre recherche.</p><div id="searchresults" class="search-results"></div></div></div>`}

/* ---------- Footer ---------- */
function footer(){
 const cols=[['Services',[['Demander un devis','demander-un-devis/'],['Service conseil en décoration','demander-un-devis/'],['Livraison et installation','contact/'],['Guide d’entretien','#']]],['Professionnels',[['Projets contract','sur-mesure/meubles/'],['Architectes & décorateurs','contact/'],['Administration','admin/']]],['Marque',[['Notre savoir-faire','fabrication-sur-mesure/'],['Collections','collections/'],['Le Mag','inspirations/'],['Visualisation 3D','visualisation-3d/']]]];
 const lk=u=>u==='#'?'#':h(u);
 return `<footer class="footer" id="footer">
 <div class="ft-news">
  <p class="ft-news-txt">Recevez par mail les dernières actualités et les offres d’Luxor Creation</p>
  <form id="newsform" class="ft-form"><input type="email" required placeholder="Votre adresse email (nom@domaine.com)" aria-label="Adresse email"><button type="submit">S’inscrire</button></form>
  <div class="ft-social"><span>Suivez-nous sur :</span>${[['ig','Instagram'],['fb','Facebook'],['pi','Pinterest'],['yt','YouTube'],['li','LinkedIn'],['tt','TikTok']].map(([k,n])=>`<a href="#" aria-label="${n}">${I[k]}</a>`).join('')}</div>
  <p class="ft-consent" id="newsout">En vous inscrivant, vous acceptez de recevoir nos propositions par e-mail et acceptez nos <a href="#">conditions d’utilisation</a> et notre <a href="#">politique de confidentialité</a>.</p>
 </div>
 <div class="ft-main">
  <div class="ft-cols">${cols.map(([t,ls])=>`<details class="ft-col" open><summary>${t}</summary>${ls.map(([n,u])=>`<a href="${lk(u)}">${n}</a>`).join('')}</details>`).join('')}</div>
  <div class="ft-about"><img class="ft-logo" src="${local('luxor-logo-gold.webp')}" alt="Luxor Création" width="900" height="781" loading="lazy"><h3>Luxor Creation : le design et l’<em>art de vivre</em> marocain.</h3><p>Dans notre showroom au Maroc, Luxor Creation propose des collections originales, une fabrication sur mesure et un haut niveau de personnalisation. Découvrez nos canapés, fauteuils, tables basses, tables de repas, chaises, rangements, lits, luminaires, coussins et objets de décoration, façonnés pour composer des intérieurs singuliers.</p><p class="ft-demo">Frontend de démonstration — prix, modèles et coordonnées illustratifs jusqu’à validation.</p></div>
  <a class="ft-store" href="${MAPS_URL}" target="_blank" rel="noopener" aria-label="Trouver notre showroom Luxor Création sur Google Maps (nouvel onglet)">${I.pin}<span>Trouver notre showroom</span><strong>Luxor Creation</strong></a>
 </div>
 <div class="ft-bar"><nav>${[['Contact','contact/'],['Tous les showrooms','contact/'],['Charte de confidentialité','#'],['Mentions légales et conditions d’utilisation du site','#'],['Politique d’accessibilité numérique','#']].map(([n,u])=>`<a href="${lk(u)}">${n}</a>`).join('')}</nav><div class="ft-country"><span>Changer de pays</span><b>Maroc</b></div></div>
</footer>
<button class="to-top" id="backtop" aria-label="Haut de page">${I.top}</button>`}

/* ---------- Shared blocks ---------- */
const sectionTitle=(t,link,txt)=>`<div class="section-head"><h2>${t}</h2>${link?`<a class="link-more" href="${h(link)}">${txt||'Tout voir'}</a>`:''}</div>`;
function card(p){const on=fav.includes(p.slug);return `<article class="p-card" data-name="${esc(p.name.toLowerCase())}" data-cat="${p.category}" data-price="${p.price}"><a class="photo" href="${purl(p)}">${picture(p.image||local(p.fallback),fallback(p),'',p.name)}${p.new?'<span class="tag">Nouveauté</span>':''}</a><button class="card-fav ${on?'on':''}" data-fav="${esc(p.slug)}" aria-label="Ajouter aux favoris">${I.heart}</button><div class="p-body"><h3><a href="${purl(p)}">${esc(p.name)}</a></h3><p class="p-type">${esc(t(typeName[p.category]||catName(p.category)))} · ${esc(t(p.material))}</p><p class="p-price">À partir de <strong>${money(p.price)}</strong></p><div class="p-swatches">${colors.slice(0,4).map(c=>`<i style="background:${c.hex}" title="${c.name}"></i>`).join('')}<span>+${colors.length-4}</span></div></div></article>`}
const carousel=(id,items)=>`<div class="rail-wrap"><button class="rail-arrow prev" data-rail="${id}" data-dir="-1" aria-label="Précédent">${I.prev}</button><div class="rail" id="${id}">${items}</div><button class="rail-arrow next" data-rail="${id}" data-dir="1" aria-label="Suivant">${I.next}</button></div>`;
const productRail=(heading,ps,id='rail-products',link='catalogue/')=>`<section class="section"><div class="wrap">${sectionTitle(heading,link,'Voir tous les produits')}${carousel(id,ps.map(p=>`<div class="rail-item">${card(p)}</div>`).join(''))}</div></section>`;
const productGridSection=(heading,ps)=>`<section class="section"><div class="wrap">${sectionTitle(heading,'catalogue/','Voir tous les produits')}<div class="product-grid four">${ps.map(card).join('')}</div></div></section>`;
const catPhoto={canapes:'canapes.webp',tables:'tables.webp',chambres:'chambres.webp',fauteuils:'view-1-0.webp',coussins:'view-1-1.webp',chaises:'tables.webp',rangements:'view-1-1.webp',decoration:'view-1-2.webp',exterieur:'hero-ivoire.webp',cuisines:'cuisine-3.webp'};
const inspos=[['salon-contemporain','Salon contemporain','Un salon lumineux où les courbes s’expriment librement.','hero-cognac.webp'],['chambre-serenite','Chambre sérénité','Des textiles délicats et une atmosphère apaisante.','chambres.webp'],['salle-a-manger','L’art de recevoir','Des matières naturelles autour d’une grande table.','tables.webp'],['matiere-naturelle','Esprit matière','Bois, fibres, étoffes : le charme des textures.','hero-ivoire.webp'],['terrasse-mediterraneenne','Terrasse méditerranéenne','La vie à l’extérieur, simplement.','hero-ivoire.webp'],['atelier-coussins','Le détail textile','Coussins, revêtements et savoir-faire.','canapes.webp']];

/* ---------- Home ---------- */
const EVENT={title:LANG==='en'?['The Luxor','Days']:['Les Journées','Luxor'],date:'12-30 NOV',sub:'Des prix exceptionnels dans toutes les collections.'};
const showcase=[
 {img:'hero-salle-manger.webp',name:'Dune',by:'design Atelier Luxor',url:'produit/tables-dune/'},
 {img:'hero-salon-beige.webp',name:'Oval',by:'design Atelier Luxor',url:'produit/fauteuils-oval/'},
 {img:'hero-fauteuil.webp',name:'Ambre',by:'design Atelier Luxor',url:'produit/canapes-ambre/'},
 {img:'hero-chambre.webp',name:'Sérénité',by:'design Atelier Luxor',url:'produit/chambres-serenite/'}
];
const eventLogo=(cls='')=>`<div class="ev-logo ${cls}"><span class="ev-mark" aria-hidden="true"><i></i><i></i><i></i></span><span class="ev-title">${EVENT.title.join('<br>')}</span><span class="ev-date">${EVENT.date}</span></div>`;
function home(){
 const promos=[
  `<div class="ps ps-event"><div class="ps-copy">${eventLogo('small')}<p class="ps-sub">${EVENT.sub}</p><a class="btn-ghost" href="${MAPS_URL}" target="_blank" rel="noopener">Trouvez votre showroom</a></div></div>`,
  `<div class="ps ps-img"><img src="${local('hero-ivoire.webp')}" alt="" loading="lazy"><div class="ps-copy"><p class="ps-kick">Nouveautés</p><p class="ps-h">Créations<br>Automne-Hiver 2026</p><a class="btn-ghost" href="${h('collections/signature/')}">Découvrir</a></div></div>`,
  `<div class="ps ps-img"><img src="${local('tables.webp')}" alt="" loading="lazy"><div class="ps-copy"><p class="ps-kick">Le catalogue</p><p class="ps-h">Feuilletez<br>toutes nos pièces</p><a class="btn-ghost" href="${h('catalogue/')}">Voir le catalogue</a></div></div>`,
  `<div class="ps ps-img"><img src="${local('chambres.webp')}" alt="" loading="lazy"><div class="ps-copy"><p class="ps-kick">Service conseil</p><p class="ps-h">Nos décorateurs<br>vous accompagnent</p><a class="btn-ghost" href="${h('demander-un-devis/')}">Prendre rendez-vous</a></div></div>`,
  `<div class="ps ps-img"><img src="${local('canapes.webp')}" alt="" loading="lazy"><div class="ps-copy"><p class="ps-kick">Savoir-faire</p><p class="ps-h">Fabrication<br>sur mesure</p><a class="btn-ghost" href="${h('fabrication-sur-mesure/')}">Découvrir l’atelier</a></div></div>`
 ];
 const mag=[['inspirations/salon-contemporain/','hero-salon-beige.webp','Salon contemporain, design Atelier Luxor','wide'],['inspirations/terrasse-mediterraneenne/','hero-ivoire.webp','Terrasse méditerranéenne',''],['collections/signature/','hero-salle-manger.webp','Créations Automne-Hiver 2026',''],['inspirations/atelier-coussins/','hero-fauteuil.webp','Le détail textile','inside'],['inspirations/chambre-serenite/','hero-chambre.webp','Chambre sérénité','']];
 return `<main id="main" class="home">
 <section class="hs hs-event" id="hs-event"><img src="${local('hero-salon-vert.webp')}" alt="Salon contemporain aux tons verts et naturels" class="kb"><div class="hs-center">${eventLogo()}<a class="hs-cta" href="${MAPS_URL}" target="_blank" rel="noopener">Trouvez votre showroom</a></div><button class="hs-pause" id="hspause" aria-label="Pause">${I.pause}</button></section>
 ${showcase.map(s=>`<section class="hs"><img src="${local(s.img)}" alt="${esc(s.name)}" loading="lazy" class="kb"><a class="hs-cap" href="${h(s.url)}"><span class="hs-name">${esc(s.name)}</span><span class="hs-by">${esc(s.by)}</span><span class="hs-more">${I.next}en savoir +</span></a></section>`).join('')}
 <section class="ba-sec" aria-label="Avant / Après : terrasse réalisée par Luxor Création">
  <div class="ba" style="--pos:50%">
   <img class="ba-after" src="${local('apres-terrasse-2.webp')}" alt="Après : terrasse aménagée par Luxor Création, salon ouvert, cheminée et bassin à cascade" loading="lazy" width="1600" height="900">
   <img class="ba-before" src="${local('avant-terrasse.webp')}" alt="Avant : la terrasse en chantier" loading="lazy" width="1600" height="900">
   <span class="ba-line" aria-hidden="true"><span class="ba-knob"><svg viewBox="0 0 24 24"><path d="m9 7-5 5 5 5M15 7l5 5-5 5"/></svg></span></span>
   <span class="ba-tag ba-tag-l">Avant</span><span class="ba-tag ba-tag-r">Après</span>
   <input class="ba-range" type="range" min="0" max="100" value="50" step="0.1" aria-label="Comparer avant et après">
  </div>
 </section>
 <section class="duo">
  <div class="duo-promo" id="promo">${promos.map((p,i)=>p.replace('class="ps ',`class="ps ${i===0?'active ':''}`)).join('')}
   <button class="sq-arrow p-prev" id="promoprev" aria-label="Précédent">${I.prev}</button><div class="p-dots">${promos.map((_,i)=>`<button data-dot="${i}" class="${i===0?'active':''}" aria-label="${t('Diapositive')} ${i+1}"></button>`).join('')}</div><button class="sq-arrow p-next" id="promonext" aria-label="Suivant">${I.next}</button>
  </div>
  <div class="duo-mag"><a class="mag-bar" href="${h('inspirations/')}"><span class="mag-t">LE MAG</span><span class="mag-by">BY <b>Luxor</b></span></a>
   <div class="mag-mosaic">${mag.map(([u,img,t,cls])=>`<a class="mm ${cls}" href="${h(u)}"><img src="${local(img)}" alt="" loading="lazy">${cls==='inside'?`<span class="mm-badge"><small>Luxor</small><b>INSIDE</b><em>L’atelier 2026</em></span>`:''}<span class="mm-cap">${t}</span></a>`).join('')}</div>
  </div>
 </section>
</main>`}

/* ---------- Page heads ---------- */
function crumbs(list){return `<nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="${h('')}">Accueil</a>${list.map(([n,u])=>u?`<span>/</span><a href="${h(u)}">${esc(n)}</a>`:`<span>/</span><span aria-current="page">${esc(n)}</span>`).join('')}</nav>`}
function head(ey,t,desc='',trail){return `<div class="page-head wrap">${crumbs(trail||[[t]])}<h1>${esc(t)}</h1>${desc?`<p>${esc(desc)}</p>`:''}</div>`}
function banner(img,t,sub){return `<section class="page-banner"><img src="${local(img)}" alt=""><div class="page-banner-copy"><h1>${esc(t)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div></section>`}

/* ---------- Catalogue: room pages (banner + one section per category) ---------- */
const rooms=[
 {id:'sejour',name:'Séjour',img:'hero-salon-vert.webp',cats:['canapes','fauteuils','coussins']},
 {id:'salle',name:'Cuisine',img:'cuisine-7.webp',cats:['cuisines','tables','chaises']},
 {id:'chambre',name:'Chambre',img:'chambres.webp',cats:['chambres']},
 {id:'rangements',name:'Rangements',img:'view-1-1.webp',cats:['rangements']},
 {id:'outdoor',name:'Outdoor',img:'hero-ivoire.webp',cats:['exterieur']},
 {id:'deco',name:'Décoration',img:'view-1-2.webp',cats:['decoration']}
];
const sectionName={canapes:'Canapés',fauteuils:'Fauteuils',coussins:'Coussins & textile',tables:'Tables de repas',chaises:'Chaises & tabourets',chambres:'Lits & chambres',rangements:'Rangements',exterieur:'Mobilier d’extérieur',decoration:'Objets & luminaires',cuisines:'Cuisines sur mesure'};
const chevron=d=>`<svg viewBox="0 0 24 24"><path d="${d==='up'?'m6 15 6-6 6 6':'m6 9 6 6 6-6'}"/></svg>`;
function rtile(p){return `<a class="rtile" href="${purl(p)}" data-coll="${esc(collOf(p)||'')}"><span class="rt-img">${picture(p.image||local(p.fallback),fallback(p),'',p.name)}</span><span class="rt-cap"><span class="rt-name">${esc(t(typeName[p.category]||''))} ${esc(p.name)}</span><span class="rt-price">${t('À partir de')} ${money(p.price)}</span></span></a>`}
function catalogue(cat=''){
 const room=cat?rooms.find(r=>r.cats.includes(cat)):null;
 const cats=room?room.cats:C.map(c=>c.id);
 const title=room?room.name:'Le catalogue';
 const img=room?room.img:'hero-ivoire.webp';
 const secs=cats.map(id=>({id,list:all().filter(p=>p.category===id)})).filter(s=>s.list.length);
 return `<main id="main" class="room" data-focus="${esc(cat)}">
 <section class="room-hero"><img src="${local(img)}" alt=""><h1>${esc(title)}</h1></section>
 ${secs.map((s,i)=>{const colls=collNames.filter(n=>s.list.some(p=>collOf(p)===n));return `<section class="rsec" id="sec-${s.id}">
  ${i>0?`<button class="rs-chev" data-step="-1" aria-label="Section précédente">${chevron('up')}</button>`:''}
  <h2>${esc(sectionName[s.id]||catName(s.id))}</h2>
  ${i<secs.length-1?`<button class="rs-chev" data-step="1" aria-label="Section suivante">${chevron('down')}</button>`:'<span class="rs-chev-space"></span>'}
  <div class="rs-filters" role="tablist"><button class="active" data-filter="">Tous</button>${colls.map(n=>`<button data-filter="${n}">${n}</button>`).join('')}</div>
  <div class="rs-grid">${s.list.map(rtile).join('')}</div>
 </section>`}).join('')}
 ${secs.length?'':'<p class="empty">Aucun produit dans cette catégorie pour le moment.</p>'}
</main>`}

/* ---------- Product ---------- */
function previewModel(p,hex){
 const paint=hex||'#d6cbbd';const neutral='#3e3831';
 const markup=p.category==='cuisines'?`<rect x="90" y="120" width="620" height="150" fill="${paint}" stroke="#8a8176" stroke-width="4"/><path d="M245 120v150M400 120v150M555 120v150" stroke="#00000022" stroke-width="3"/><rect x="90" y="270" width="620" height="8" fill="#f3c98b" opacity=".8"/><rect x="90" y="278" width="620" height="92" fill="#e8e2d8"/><rect x="80" y="370" width="640" height="16" fill="#232323"/><rect x="90" y="386" width="620" height="150" fill="${paint}" stroke="#8a8176" stroke-width="4"/><path d="M90 460h620M296 386v150M503 386v150" stroke="#1d1d1d" stroke-width="4"/><rect x="330" y="362" width="140" height="10" fill="#111"/>`:p.category==='tables'?`<ellipse cx="400" cy="520" rx="260" ry="36" fill="#ddd6cc" opacity=".7"/><path d="M205 330 Q200 295 255 294 H555 Q610 295 599 330 L565 398 H241Z" fill="${paint}" stroke="#897e70" stroke-width="5"/><path d="M245 399 L213 534 H270 L309 401 M553 399 L585 534 H530 L490 401" fill="${neutral}"/>`:p.category==='chambres'?`<ellipse cx="400" cy="565" rx="285" ry="28" fill="#d4cdc3"/><rect x="180" y="172" width="440" height="280" rx="60" fill="${paint}" stroke="#9a9085" stroke-width="5"/><rect x="148" y="395" width="510" height="134" rx="24" fill="${paint}" stroke="#8f857a" stroke-width="5"/><rect x="195" y="391" width="410" height="90" rx="18" fill="#efeee9"/><rect x="227" y="359" width="165" height="65" rx="25" fill="#fcfaf6"/><rect x="407" y="359" width="165" height="65" rx="25" fill="#fcfaf6"/>`:p.category==='fauteuils'||p.category==='chaises'?`<ellipse cx="400" cy="558" rx="170" ry="29" fill="#d8d1c5"/><rect x="283" y="160" width="234" height="270" rx="92" fill="${paint}" stroke="#8d8277" stroke-width="5"/><rect x="284" y="349" width="232" height="129" rx="52" fill="${paint}" stroke="#988879" stroke-width="6"/><path d="M330 477 L307 555 H341 L367 477 M460 477 L487 555 H452 L431 477" fill="${neutral}"/>`:`<ellipse cx="399" cy="550" rx="303" ry="38" fill="#d5cec3" opacity=".7"/><rect x="111" y="300" width="578" height="205" rx="87" fill="${paint}" stroke="#96877c" stroke-width="6"/><rect x="148" y="178" width="501" height="221" rx="80" fill="${paint}" stroke="#99877a" stroke-width="5"/><path d="M207 189 Q243 160 291 187 L295 358 Q231 370 200 342Z M324 182 Q395 163 473 183 L474 360 H324Z M507 184 Q564 161 606 196 L603 345 Q560 362 506 357Z" fill="${paint}" stroke="#ffffff77" stroke-width="8"/><rect x="175" y="339" width="453" height="139" rx="52" fill="${paint}" stroke="#aa9480" stroke-width="5"/><path d="M181 468 L172 517 H222 L232 478 M572 478 L583 517 H626 L615 467" fill="${neutral}"/>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="650" viewBox="0 0 800 650"><rect width="800" height="650" fill="#f7f7f7"/><path d="M0 546 H800" stroke="#e2e2e2" stroke-width="2"/>${markup}<text x="400" y="605" fill="#707070" font-family="Arial" font-size="16" text-anchor="middle">${t('APERÇU DE COLORIS • SIMULATION GRAPHIQUE')}</text></svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function product(slug){let p=all().find(x=>x.slug===slug);if(!p&&slug==='demo')p=all().find(x=>x.slug===new URLSearchParams(location.search).get('id'));if(!p)return `<main id="main">${head('','Produit introuvable','Ce produit de démonstration n’est plus disponible.')}</main>`;
 const imgs=[...(p.gallery?p.gallery.map(local):[p.image||local(p.fallback),local(p.fallback),local('view-1-0.webp'),local('view-1-1.webp')]),previewModel(p,colors[0].hex)];
 const related=all().filter(x=>x.category===p.category&&x.slug!==p.slug).slice(0,8);const on=fav.includes(p.slug);
 return `<main id="main" class="pdp-page"><div class="wrap">${crumbs([['Produits','catalogue/'],[catName(p.category),'catalogue/'+p.category+'/'],[p.name]])}
 <section class="detail"><div class="gallery"><div class="large-img" id="large"><img id="big" src="${esc(imgs[0])}" onerror="this.onerror=null;this.src='${fallback(p)}'" alt="${esc(p.name)}"><button class="sq-arrow g-prev" id="gprev" aria-label="Image précédente">${I.prev}</button><button class="sq-arrow g-next" id="gnext" aria-label="Image suivante">${I.next}</button><span class="zoom-tip">${matchMedia('(hover: none)').matches ? 'Toucher pour agrandir' : 'Survoler pour zoomer · cliquer pour agrandir'}</span></div><div class="thumbs" id="thumbs">${imgs.map((u,i)=>`<button class="thumb ${i===0?'active':''}" data-idx="${i}" aria-label="${t('Vue')} ${i+1}">${picture(u,fallback(p),'',p.name)}</button>`).join('')}</div><p class="legal-small">Galerie d’illustration. Les vues secondaires ne sont pas des photographies certifiées du même modèle.</p></div>
 <div class="detail-info">${p.new?'<span class="tag static">Nouveauté</span>':''}<h1>${esc(p.name)}</h1><p class="pdp-sub">${esc(t(typeName[p.category]||catName(p.category)))} · ${t('Collection')} ${esc(collOf(p))}</p><p class="pdp-ref">${t('Réf.')} ${esc(p.sku)}</p><div class="detail-price">À partir de <strong>${money(p.price)}</strong></div>
 <div class="pdp-block"><p class="pdp-label">Coloris : <strong id="colorname">${esc(t(colors[0].name))}</strong></p><div class="swatches">${colors.map((c,i)=>`<button class="swatch ${i===0?'on':''}" title="${c.name}" data-color="${c.name}" data-hex="${c.hex}" aria-label="${t('Couleur')} ${esc(t(c.name))}"><span style="background:${c.hex}"></span></button>`).join('')}</div><p class="legal-small" id="colorwarning">Le dernier visuel est une simulation du même modèle : choisir un coloris met à jour ce visuel.</p></div>
 <div class="detail-actions"><a class="btn btn-dark" id="productquote" href="${h('demander-un-devis/')}?produit=${encodeURIComponent(p.name)}">Demander un devis</a><button class="btn btn-line" id="addfav">${t(on?'♥ Dans les favoris':'♡ Ajouter aux favoris')}</button><a class="pdp-store" href="${h('contact/')}">${I.pin}<span>Voir ce produit en showroom</span></a></div>
 <div class="accordion"><details open><summary>Description</summary><p>${esc(tDesc(p))}</p></details><details><summary>Dimensions</summary><div class="spec"><span>Dimensions</span><strong>${esc(p.dimensions==='Sur mesure'?t('Sur mesure'):p.dimensions)}</strong></div></details><details><summary>Matières & entretien</summary><div class="spec"><span>Matières</span><strong>${esc(t(p.material))}</strong></div><div class="spec"><span>Référence</span><strong>${esc(p.sku)}</strong></div></details><details><summary>Livraison & services</summary><p>Livraison, disponibilité et tarifs : à confirmer auprès de l’entreprise. Site vitrine de démonstration sans commande ni paiement.</p></details></div></div></section></div>
 ${related.length?productRail('Vous aimerez aussi',related,'rail-related','catalogue/'+p.category+'/'):''}</main>`}

/* ---------- Collections / inspirations / services ---------- */
function collections(which=''){const imgs=['hero-ivoire.webp','hero-cognac.webp','hero-ivoire.webp','canapes.webp'];
 if(which){const idx=Math.max(0,collNames.findIndex(x=>x.toLowerCase()===which));const label=collNames[idx];return `<main id="main">${banner(imgs[idx],t('Collection')+' '+label,'Un dialogue de textures et de matières.')}<div class="wrap">${crumbs([['Collections','collections/'],[label]])}</div>${productGridSection(t('La collection')+' '+label,P.slice(idx*6,idx*6+8))}</main>`}
 return `<main id="main">${head('','Nos collections','Quatre Luxor de création, quatre manières de composer votre intérieur.',[['Collections']])}<section class="section tight"><div class="wrap cat-mosaic two">${collNames.map((n,i)=>`<a class="cat-tile" href="${h('collections/'+n.toLowerCase()+'/')}"><img src="${local(imgs[i])}" alt="" loading="lazy"><h3>${n}</h3></a>`).join('')}</div></section></main>`}
function inspirations(which=''){
 if(which){const z=inspos.find(x=>x[0]===which);if(!z)return `<main id="main">${head('','Inspiration introuvable')}</main>`;return `<main id="main">${banner(z[3],z[1],z[2])}<div class="wrap">${crumbs([['Le Mag','inspirations/'],[z[1]]])}<div class="inspo-gallery"><img src="${local('view-1-1.webp')}" alt=""><img src="${local('view-1-2.webp')}" alt=""></div><div class="statement left"><h2>Vivre un espace autrement.</h2><p>${esc(t(z[2]))} ${t('Nos inspirations sont des exemples de composition et de style. Explorez les pièces de mobilier correspondant à cette ambiance.')}</p></div></div>${productGridSection('Les pièces de cette ambiance',P.filter((p,i)=>i%7===inspos.indexOf(z)%7).slice(0,4))}</main>`}
 return `<main id="main">${head('','Le Mag Luxor','Des ambiances et idées d’aménagement pour composer votre intérieur.',[['Le Mag']])}<section class="section tight"><div class="wrap mag-grid">${inspos.map(z=>`<a class="mag-card" href="${h('inspirations/'+z[0]+'/')}"><div class="mag-img"><img src="${local(z[3])}" alt="" loading="lazy"></div><p class="kicker">Inspiration</p><h3>${z[1]}</h3><p>${z[2]}</p></a>`).join('')}</div></section></main>`}
function services(which=''){const serviceNames={coussins:['Coussins sur mesure','Les détails qui changent tout.','hero-ivoire.webp'],canapes:['Canapés sur mesure','Un canapé pensé pour votre intérieur.','hero-cognac.webp'],meubles:['Meubles sur mesure','La liberté de composer selon votre espace.','tables.webp']};
 if(which){const z=serviceNames[which]||serviceNames.coussins;return `<main id="main">${banner(z[2],z[0],z[1])}<div class="wrap">${crumbs([['Sur mesure','fabrication-sur-mesure/'],[z[0]]])}</div><section class="split"><div class="split-img"><img src="${local(which==='coussins'?'view-1-1.webp':'canapes.webp')}" alt=""></div><div class="split-copy"><p class="kicker">Création personnelle</p><h2>À votre mesure</h2><p>Choix des tissus, du confort, des dimensions et des finitions. Imaginez votre projet avec notre équipe, du premier dessin au devis personnalisé.</p><a class="btn btn-dark" href="${h('demander-un-devis/')}">Décrire mon projet</a></div></section></main>`}
 return `<main id="main">${banner('hero-cognac.webp','Fabrication sur mesure','Un atelier pour les coussins, les canapés et les meubles personnalisés.')}<div class="wrap">${crumbs([['Sur mesure']])}</div><section class="section tight"><div class="wrap cat-mosaic three">${Object.entries(serviceNames).map(([k,z])=>`<a class="cat-tile" href="${h('sur-mesure/'+k+'/')}"><img src="${local(z[2])}" alt="" loading="lazy"><h3>${z[0]}</h3></a>`).join('')}</div></section></main>`}
function threeD(){return `<main id="main">${banner('hero-ivoire.webp','Visualisation 3D','Un nouveau moyen de se projeter dans votre intérieur.')}<div class="wrap">${crumbs([['Visualisation 3D']])}</div><section class="split"><div class="split-copy"><p class="kicker">Bientôt disponible</p><h2>Imaginez avant de réaliser</h2><p>Notre futur espace 3D vous permettra d’explorer des ambiances et des associations de mobilier. Pour le moment, les photographies sont des exemples fixes, pas un configurateur interactif.</p><a class="btn btn-dark" href="${h('catalogue/')}">Explorer le catalogue</a></div><div class="split-img"><img src="${local('hero-ivoire.webp')}" alt=""></div></section></main>`}
function quote(type='Devis'){const t=type==='Contact'?'Contactez-nous':'Demander un devis';return `<main id="main">${head('',t,'Pour discuter de mobilier et de fabrication sur mesure. Formulaire de démonstration : aucun message n’est envoyé.',[[t]])}<div class="wrap form-wrap"><div class="admin-note">Ce formulaire est une démonstration frontend. Les informations saisies ne sont pas transmises à l’entreprise.</div><form class="form" id="quoteform"><label>Nom et prénom *<input name="nom" required></label><label>Téléphone *<input type="tel" name="telephone" required></label><label>Adresse email<input type="email"></label><label>Ville<input></label><label>Objet<select name="objet"><option>Demande de devis</option><option>Fabrication de coussins</option><option>Fabrication de canapé</option><option>Fabrication de meubles</option><option>Service conseil en décoration</option></select></label><label>Dimensions souhaitées<input></label><label class="span2">Votre projet<textarea placeholder="Décrivez votre projet..."></textarea></label><button class="btn btn-dark span2" type="submit">Envoyer ma demande</button></form><div id="quoteout"></div></div></main>`}
function favorites(){const list=all().filter(p=>fav.includes(p.slug));return `<main id="main">${head('','Mes favoris','Retrouvez les pièces enregistrées dans ce navigateur.',[['Mes favoris']])}<section class="section tight"><div class="wrap">${list.length?`<div class="product-grid plp">${list.map(card).join('')}</div>`:`<div class="empty-state"><p>Vous n’avez pas encore ajouté de favoris.</p><a class="btn btn-dark" href="${h('catalogue/')}">Découvrir les produits</a></div>`}</div></section></main>`}
function admin(){return `<main id="main">${head('','Back-office DEMO','Maquette de gestion locale : aucune connexion, aucun serveur et aucune sécurité administrateur.',[['Administration']])}<div class="wrap" style="padding-bottom:100px"><div class="admin-note">⚠️ DÉMONSTRATION UNIQUEMENT — les changements sont conservés dans le navigateur local. Ce panneau ne doit pas être utilisé comme administration de production.</div><div class="section-head"><h2>Gestion du catalogue</h2><button class="btn btn-dark" id="addproduct">+ Nouveau produit</button></div><div id="adminform" class="hidden" style="margin-bottom:35px"><form class="form" id="productform"><label>Nom du produit<input name="name" required></label><label>Prix (DH)<input name="price" required type="number" min="0"></label><label>Catégorie<select name="category">${C.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label><label>URL de la photo (facultatif)<input name="photo"></label><label class="span2">Description<textarea name="description"></textarea></label><button type="submit" class="btn btn-dark span2">Enregistrer en DEMO</button></form></div><div class="table-scroll"><table class="admin-table"><thead><tr><th>Référence</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Action</th></tr></thead><tbody id="adminrows">${all().map(p=>`<tr><td>${esc(p.sku)}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td><button data-delete="${esc(p.slug)}">Supprimer</button></td></tr>`).join('')}</tbody></table></div></div></main>`}

/* ---------- Render ---------- */
let ac;
function init(){ac?.abort();ac=new AbortController();const k=cfg.kind;const view=k==='home'?home():k==='catalogue'?catalogue():k.startsWith('category:')?catalogue(k.split(':')[1]):k.startsWith('product:')?product(k.slice(8)):k==='collections'?collections():k.startsWith('collection:')?collections(k.slice(11)):k==='inspirations'?inspirations():k.startsWith('inspiration:')?inspirations(k.slice(12)):k==='services'?services():k.startsWith('service:')?services(k.slice(8)):k==='3d'?threeD():k==='contact'?quote('Contact'):k==='quote'?quote():k==='favorites'?favorites():k==='admin'?admin():home();
 document.body.classList.toggle('is-home',k==='home');
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#2F4F46');
 if(!document.querySelector('link[rel="icon"]')){const fi=document.createElement('link');fi.rel='icon';fi.type='image/png';fi.href=local('favicon.png');document.head.appendChild(fi)}
 document.getElementById('app').innerHTML=nav()+view+footer()+`<div class="cursor" id="cursor" aria-hidden="true"></div><div class="lightbox" id="lightbox"><button id="lightclose" aria-label="Fermer">${I.close}</button><img id="lightimage" alt="Image agrandie"></div>`;tr(document.getElementById('app'));wire(k)}

function wire(k){const sig=ac.signal;const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const body=document.body;
 const saveFav=()=>{localStorage.setItem('udc_fav_v3',JSON.stringify(fav));const c=$('#favcount');if(c)c.textContent=fav.length||''};
 const toggleFav=slug=>{fav=fav.includes(slug)?fav.filter(x=>x!==slug):[...fav,slug];saveFav();return fav.includes(slug)};

 /* Panels: only one of drawer / mega / search open at a time */
 const state={drawer:false,mega:false,search:false};
 function setPanel(name,open){
  for(const n in state)state[n]=false;if(name)state[name]=open;
  $('#drawer').classList.toggle('open',state.drawer);
  const wasMega=$('#mega').classList.contains('open');
  if(state.mega&&!wasMega)pmGo('produits',true);
  $('#mega').classList.toggle('open',state.mega);$('#mega').setAttribute('aria-hidden',!state.mega);
  $('#searchmodal').classList.toggle('open',state.search);
  $('#overlay').classList.toggle('open',state.drawer);
  body.classList.toggle('menu-open',state.drawer);
  body.classList.toggle('locked',state.drawer||state.search||state.mega);
  $('#openmenu').setAttribute('aria-expanded',state.drawer);
  $('#megaopen')?.setAttribute('aria-expanded',state.mega);
  $('#megaopen')?.classList.toggle('active',state.mega);
  if(!state.drawer)setTimeout(()=>showLevel('main'),300);
  if(state.search)setTimeout(()=>$('#globalsearch').focus(),50);
 }
 function showLevel(l){$$('.drawer-level').forEach(d=>d.classList.toggle('active',d.dataset.level===l));$('#drawer').scrollTop=0}
 showLevel('main');
 $('#langsw').addEventListener('click',()=>setLang(LANG==='en'?'fr':'en'));
 $('#openmenu').addEventListener('click',()=>setPanel('drawer',!state.drawer));
 $('#megaopen')?.addEventListener('click',()=>setPanel('mega',!state.mega));
 $$('[data-pmclose]').forEach(b=>b.addEventListener('click',()=>setPanel(null)));
 /* Products panel: level navigation with staggered line animation */
 let pmLevel='produits',pmBusy=false;
 function pmGo(id,instant=false){
  const next=$(`.pm-list[data-level="${id}"]`),prev=$('.pm-list.active');if(!next||(prev===next&&!instant))return;
  const lvl=pmLevels[id];pmLevel=id;
  $('#pmbacklbl').textContent=t(lvl.title);$('#pmback').classList.toggle('hide',!lvl.parent);
  const show=()=>{$$('.pm-list').forEach(l=>l.classList.remove('active','leaving','in','reveal-now'));next.classList.add('active');void next.offsetWidth;next.classList.add('in');if(!instant)next.classList.add('reveal-now');pmBusy=false;if(state.mega)next.querySelector('.pm-item')?.focus({preventScroll:true})};
  if(instant||!prev){show();return}
  pmBusy=true;prev.classList.add('leaving');setTimeout(show,380);
 }
 $$('[data-pm]').forEach(b=>b.addEventListener('click',()=>{if(!pmBusy)pmGo(b.dataset.pm)}));
 $('#pmback').addEventListener('click',()=>{const p=pmLevels[pmLevel].parent;if(p&&!pmBusy)pmGo(p)});
 /* Follower cursor (desktop): ring that grows on links, fills over product tiles */
 if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const c=$('#cursor');let x=-100,y=-100,cx=x,cy=y,raf=0;
  const loop=()=>{cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px)`;raf=(Math.abs(x-cx)+Math.abs(y-cy)>.3)?requestAnimationFrame(loop):0};
  document.addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;const t=e.target;c.classList.add('on');
   c.classList.toggle('fill',!!t.closest('.rtile'));c.classList.toggle('big',!t.closest('.rtile')&&!!t.closest('a,button,summary,label,select'));c.classList.toggle('dark',!!t.closest('.pm-panel'));
   if(!raf)raf=requestAnimationFrame(loop)},{passive:true,signal:sig});
  document.addEventListener('mouseleave',()=>c.classList.remove('on'),{signal:sig})}
 $('#searchopen').addEventListener('click',()=>setPanel('search',!state.search));
 $('#searchclose').addEventListener('click',()=>setPanel(null));
 $('#overlay').addEventListener('click',()=>setPanel(null));
 $('#searchmodal').addEventListener('click',e=>{if(e.target.id==='searchmodal')setPanel(null)});
 $$('[data-open]').forEach(b=>b.addEventListener('click',()=>showLevel(b.dataset.open)));
 $$('[data-back]').forEach(b=>b.addEventListener('click',()=>showLevel('main')));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.mega&&pmLevels[pmLevel].parent&&pmLevel!=='produits'){pmGo(pmLevels[pmLevel].parent);return}setPanel(null);$('#lightbox')?.classList.remove('open')}},{signal:sig});
 $('#globalsearch').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$('#searchresults').innerHTML=!q?'':all().filter(p=>p.name.toLowerCase().includes(q)||catName(p.category).toLowerCase().includes(q)||t(catName(p.category)).toLowerCase().includes(q)||p.material.toLowerCase().includes(q)||t(p.material).toLowerCase().includes(q)).slice(0,6).map(p=>`<a class="sr-item" href="${purl(p)}">${picture(p.image||local(p.fallback),fallback(p),'',p.name)}<span><strong>${esc(p.name)}</strong><em>${esc(t(typeName[p.category]||''))} · ${money(p.price)}</em></span></a>`).join('')||`<p class="search-hint">${t('Aucun résultat.')}</p>`});

 /* Back to top */
 const tt=$('#backtop');let compact=null;const onScroll=()=>{tt.classList.toggle('show',scrollY>500);$('#header').classList.toggle('scrolled',scrollY>10);const c=compact?scrollY>20:scrollY>60;if(c!==compact){compact=c;body.classList.toggle('hdr-compact',c)}};addEventListener('scroll',onScroll,{passive:true,signal:sig});onScroll();
 tt.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

 /* Footer */
 $('#newsform')?.addEventListener('submit',e=>{e.preventDefault();$('#newsout').textContent=t('Merci ! Inscription enregistrée en démonstration (aucun envoi réel).')});
 if(matchMedia('(max-width:760px)').matches)$$('.ft-col').forEach(d=>d.removeAttribute('open'));

 /* Card favorites + rails */
 document.addEventListener('click',e=>{const b=e.target.closest('[data-fav]');if(!b)return;e.preventDefault();b.classList.toggle('on',toggleFav(b.dataset.fav))},{signal:sig});
 $$('.rail-arrow').forEach(b=>b.addEventListener('click',()=>{const r=document.getElementById(b.dataset.rail);r.scrollBy({left:+b.dataset.dir*r.clientWidth*.8,behavior:'smooth'})}));

 /* Home */
 if(k==='home'){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Event section pause (slow-motion background like a video)
  const ev=$('#hs-event'),pb=$('#hspause');let evPlay=!reduce;
  const syncEv=()=>{ev.classList.toggle('paused',!evPlay);pb.innerHTML=evPlay?I.pause:I.play;pb.setAttribute('aria-label',t(evPlay?'Pause':'Lecture'))};
  pb.addEventListener('click',()=>{evPlay=!evPlay;syncEv()});syncEv();
  // Reveal captions/images as each full-screen section enters
  const io=new IntersectionObserver(es=>es.forEach(en=>en.target.classList.toggle('in',en.isIntersecting)),{threshold:.25});
  $$('.hs').forEach(s=>io.observe(s));
  // Promo carousel
  const ps=$$('.ps'),dots=$$('.p-dots button');let i=0,timer;
  const go=n=>{i=(n+ps.length)%ps.length;ps.forEach((s,j)=>s.classList.toggle('active',j===i));dots.forEach((d,j)=>d.classList.toggle('active',j===i));clearTimeout(timer);if(!reduce)timer=setTimeout(()=>go(i+1),6000)};
  $('#promoprev').onclick=()=>go(i-1);$('#promonext').onclick=()=>go(i+1);dots.forEach(d=>d.onclick=()=>go(+d.dataset.dot));
  $('#promo').addEventListener('mouseenter',()=>clearTimeout(timer));$('#promo').addEventListener('mouseleave',()=>go(i));
  go(0);sig.addEventListener('abort',()=>clearTimeout(timer));
 }

 /* Catalogue room pages: collection filters + section chevrons */
 if(k==='catalogue'||k.startsWith('category:')){
  $$('.rsec').forEach(sec=>{const grid=sec.querySelector('.rs-grid');
   sec.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
    sec.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));
    grid.classList.add('fading');setTimeout(()=>{grid.querySelectorAll('.rtile').forEach(t=>t.classList.toggle('hidden',!!b.dataset.filter&&t.dataset.coll!==b.dataset.filter));grid.classList.remove('fading')},260)}));
   sec.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{const all=$$('.rsec'),i=all.indexOf(sec)+ +b.dataset.step;all[i]?.scrollIntoView({behavior:'smooth'})}))});
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.08});
  $$('.rtile').forEach(t=>io.observe(t));
  const f=$('.room')?.dataset.focus;const first=$('.rsec');if(f&&first&&first.id!=='sec-'+f)requestAnimationFrame(()=>document.getElementById('sec-'+f)?.scrollIntoView())}

 /* Product page */
 if(k.startsWith('product:')){const p=all().find(x=>x.slug===k.slice(8))||all().find(x=>x.slug===new URLSearchParams(location.search).get('id'));
  if(p){const imgs=$$('.thumb img').map(x=>x.src);let idx=0;
  const set=n=>{idx=(n+imgs.length)%imgs.length;$('#big').src=imgs[idx];$$('.thumb').forEach((b,j)=>b.classList.toggle('active',idx===j))};
  $$('.thumb').forEach(b=>b.addEventListener('click',()=>set(+b.dataset.idx)));
  $('#gprev')?.addEventListener('click',e=>{e.stopPropagation();set(idx-1)});$('#gnext')?.addEventListener('click',e=>{e.stopPropagation();set(idx+1)});
  const large=$('#large');
  large?.addEventListener('mousemove',e=>{if(e.target.closest('.sq-arrow'))return large.classList.remove('zoomed');const r=large.getBoundingClientRect();$('#big').style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`;large.classList.add('zoomed')});
  large?.addEventListener('mouseleave',()=>large.classList.remove('zoomed'));
  large?.addEventListener('click',e=>{if(e.target.closest('.sq-arrow'))return;$('#lightimage').src=$('#big').src;$('#lightbox').classList.add('open')});
  $$('.swatch').forEach(b=>b.addEventListener('click',()=>{$$('.swatch').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('#colorname').textContent=t(b.dataset.color);sessionStorage.setItem('udc-color-'+p.slug,b.dataset.color);imgs[imgs.length-1]=previewModel(p,b.dataset.hex);$$('.thumb').at(-1).querySelector('img').src=imgs[imgs.length-1];set(imgs.length-1);$('#productquote').href=h('demander-un-devis/')+'?produit='+encodeURIComponent(p.name+' - '+b.dataset.color)}));
  $('#addfav')?.addEventListener('click',()=>{$('#addfav').textContent=t(toggleFav(p.slug)?'♥ Dans les favoris':'♡ Ajouter aux favoris')})}}
 $('#lightclose')?.addEventListener('click',()=>$('#lightbox').classList.remove('open'));
 $('#lightbox')?.addEventListener('click',e=>{if(e.target.id==='lightbox')$('#lightbox').classList.remove('open')});

 /* Avant / Après slider */
 $$('.ba').forEach(ba=>{const r=ba.querySelector('.ba-range');const set=()=>ba.style.setProperty('--pos',r.value+'%');r.addEventListener('input',set);set()});

 /* Forms / admin */
 $('#quoteform')?.addEventListener('submit',e=>{e.preventDefault();$('#quoteout').innerHTML=`<div class="info-ribbon">${t('Formulaire DEMO validé localement. Pour envoyer de vraies demandes, il faudra connecter un backend ou un canal de contact.')}</div>`});
 const pre=new URLSearchParams(location.search).get('produit');if(pre&&$('#quoteform textarea'))$('#quoteform textarea').value=t('Produit :')+' '+pre+'\n';
 $('#addproduct')?.addEventListener('click',()=>$('#adminform').classList.toggle('hidden'));
 $('#productform')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target);const name=String(fd.get('name')||'').trim(),price=+fd.get('price')||0,cat=String(fd.get('category')),id='demo-'+Date.now(),photo=String(fd.get('photo')||'');if(!name)return;custom.push({id,name,slug:id,category:cat,price,sku:'DEMO-'+custom.length,description:String(fd.get('description')),material:'À préciser',dimensions:'Sur mesure',image:photo||local(catPhoto[cat]||'hero-ivoire.webp'),fallback:catPhoto[cat]||'hero-ivoire.webp'});localStorage.setItem('udc_products_v3',JSON.stringify(custom));location.reload()});
 $$('[data-delete]').forEach(b=>b.onclick=()=>{if(!confirm('Supprimer ce produit de démonstration ?'))return;const slug=b.dataset.delete;if(custom.some(p=>p.slug===slug)){custom=custom.filter(p=>p.slug!==slug);localStorage.setItem('udc_products_v3',JSON.stringify(custom))}else{hidden.push(slug);localStorage.setItem('udc_hidden_v3',JSON.stringify(hidden))}location.reload()});
}
init();
})();
