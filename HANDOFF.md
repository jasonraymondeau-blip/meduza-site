# Meduza — site (wireframe fonctionnel) · passation vers Claude Code

> État au 13 octobre 2026 (mis à jour après la session de retouches visuelles du 12-13/10). Site d'une agence digitale à Maurice (sites, apps, campagne de lancement). Fondateur : Jason (côté développement). La partie communication / UGC est tenue par sa conjointe (@boun_in_mauritius).

## 0. Où on en est / où on va (lire en premier)
Dépôt GitHub du projet : https://github.com/jasonraymondeau-blip/meduza-site (privé).
**Site officiel et complet (à garder comme référence) : https://jasonraymondeau-blip.github.io/meduza-site/**
Le workflow `.github/workflows/` (« Deploy to GitHub Pages ») se déclenche **uniquement sur un push sur `main`** : c'est ce push qui met le site en ligne. Il ne copie que `index.html`, `app.js`, `style.css`, `cartes-interactions.css/js` (pas le dossier `assets/`).
Tout ce qui a été testé en local (`http://localhost:8141`) est poussé sur `main`, rien en attente.

**Fait pendant la session du 12-13/10 :**
- Hero, cartes Services, tableau comparatif, section Réalisations, section Contact : nombreuses retouches visuelles (voir section 3 ci-dessous, mise à jour).
- Carte projet (Réalisations) : passage à une image plein cadre avec texte superposé façon référence, puis **retour en arrière explicite** à la version carte classique (voir §4) — ne pas la repasser en plein bord/100vh sauf nouvelle demande.
- Section Services : les 4 cartes utilisent maintenant de vraies mini-interfaces animées (voir §3 et §5) au lieu des anciennes animations SVG. Badge (pill) et triangle en bas à droite retirés sur les 4 cartes.
- Section Contact : nouvelle mini-carte flottante (statut « Disponible pour un projet » + Nous/Vous/+ + bouton Contact) posée sur la carte blanche existante ; bras/mains redimensionnés pour ne plus pixelliser sur grand écran.
- Grille Services : 2 colonnes/2 rangées sur téléphone et tablette (≤1023px), 4 colonnes sur ordinateur ; marges latérales réduites, cartes agrandies.

**Interrompu / à clarifier avant de continuer :**
- Dernier message de Jason avant la bascule vers le cloud (avec une capture d'écran du formulaire « Déposer une annonce » de leboncoin.fr) : *« Peut être faire comme cela sur ordinateur et pour les deux ne pas mettre les 4 emplacement photo fait comme c'est actuellement un seul drag and drop »*. Le contexte exact (quelle section du site ? un futur formulaire ?) n'a pas été établi avant l'interruption — **demander confirmation à Jason avant d'implémenter quoi que ce soit ici**, ne pas deviner.

## 1. Lancer le projet
Site statique, **sans framework** : `index.html` + `style.css` + `app.js` + `assets/`.
- Ouvrir `index.html` dans le navigateur, ou `python3 -m http.server 8000` puis http://localhost:8000
- Vérifier : `pip install playwright && playwright install chromium && python tools/check.py` (erreurs JS + captures ordinateur/téléphone dans `tools/shots/`)
- Version publiée de référence (artifact Claude) : https://claude.ai/artifact/NpLLRCEywj7YTMiqtXbCUJ
- Polices via Google Fonts : Inter (axe `opsz` forcé à 32 = « Inter Display ») + Cormorant Garamond (romain + italique). Réseau requis.

## 2. Structure
```
index.html                  balisage des 10 sections
style.css                   tout le CSS (variables en tête, puis sections, puis surcharges « test » en bas)
app.js                      tout le JS (un seul fichier, IIFE)
cartes-interactions.css/js  mini-interfaces animées des 4 cartes Services (fichier autonome, voir §5)
assets/                     images utilisées par le site (hero, whyus, about-1, avatar, mains, logos masques)
assets/brand/                fichiers d'origine (logos transparents blanc / bordeaux, photos et mains d'origine)
tools/check.py               contrôle rapide
```
Les images du site sont référencées dans `app.js` par la liste `IMAGES` (clés = attribut `data-slot` des blocs). Les logos `--logo` et `--mk` sont en data-URI dans `style.css` (un masque CSS ne marche pas depuis `file://` avec un fichier externe).

## 3. Les sections, dans l'ordre (id / fond)
| Section | id | fond (`data-bg`) | Contenu |
|---|---|---|---|
| Hero | `#top` | msg | Photo plein cadre, titre « AGENCE CRÉATIVE / DIGITALE » (Cormorant), sous-titre. Ordinateur : image large (`hero-wide.jpg`), femme à droite. Téléphone : `hero.jpg`, centrée, remontée de 9 %. |
| Message | `#text` | msg | Texte épinglé « Comme Meduza, Nos Créations Fascinent Avant De Convaincre. » allumé mot à mot ; « Créations » et « Convaincre » partent vers les cartes 01 et 02. |
| Services | `#services` | d2 | 4 cartes (Création, Convaincre, Accompagnement, Garantie 90 jours). 01 et 02 arrivent du message en volant, 03 et 04 sont statiques. Chaque carte a une mini-interface animée en boucle (voir §5, fichiers `cartes-interactions.*`) : clavier Mac qui tape, Reel Instagram avec commentaires, conversation WhatsApp, compteur 90 jours + checklist. Grille 2 colonnes (téléphone/tablette, ≤1023px) ou 4 colonnes (ordinateur, ≥1024px). |
| Pourquoi nous | `#pourquoi-nous` | light | Titre + tableau comparatif Agence classique / Meduza (colonne bordeaux en un bloc, lignes qui apparaissent au scroll). Téléphone : l'image des mannequins est ici, sous le tableau. |
| Réalisations | `#realisations` | light | Ordinateur : image à gauche (`.whyimg`), titre « Eux se ressemblent tous. / Nous, on ne ressemble à personne. » centré, collé en haut, 3 éléments (Zafer, boun_in_mauritius, Chocolaterie Coutant) qui se bloquent 150 px dessous, puis 3 cartes projets empilées (`.pcard`, image + panneau, **pas** plein bord/100vh — testé puis annulé sur demande explicite). |
| Témoignage | (sans id) | light | Citation en Cormorant italique, bulle ronde. **Texte provisoire.** |
| Qui sommes-nous | `#about` | d2 | Colonne gauche (photo verticale, onglets, « Une question ? ») + FAQ de 6 questions (colonne droite collée, la gauche défile). |
| Audience | `#audience` | d1 | Titre « Votre projet présenté à une vraie audience. » + bandeau de logos qui défile (placeholders). |
| Contact | `#contact` | d2 | Mains qui passent au-dessus d'une carte blanche (`.ccard`). À l'intérieur : texte + bouton Contact à gauche, et à droite une mini-carte flottante (`.cmini`) avec statut « Disponible pour un projet », ronds en trait + photo + « VOUS » en pointillés + bouton Contact. |
| Pied de page | `<footer>` | d2 | Liens, mentions. |
Barre de navigation : Accueil, Studio, Qui sommes-nous + bouton burger (le menu contient Contact). Elle devient pleine (couleur du fond) quand les mots « Créations » / « Convaincre » commencent à s'éclairer.

## 4. Décisions de Jason à respecter
- **Langue et ton** : français simple et direct, pas d'anglicismes ; réponses courtes, sans long résumé.
- **Style** : wireframe fonctionnel ; pas de dégradé blanc-noir ; **pas de lueurs bordeaux** (contours lumineux en blanc, le bordeaux passe par la teinte des fonds) ; **pas de grain / noise** (essayé puis retiré) ; pas d'animation GSAP (essayée, retirée : trait de survol au menu refusé).
- **Fonds** : sombres `#1c0508` (message) et `rgb(38,9,15)` (services, FAQ, contact, footer) ; clair `rgb(249,247,244)`. Passage sombre → clair en ~0,4 s, jamais figé à mi-chemin ; seuils `TRIG` : Pourquoi nous 0,4, Qui sommes-nous 0,2.
- **Cartes sombres** : fond `#230b0f`, pastilles/onglets `#311318`, contour `rgba(255,255,255,.09)`, coins 8 px (Services, FAQ). Carte contact : 24 px.
- **Cartes 01/02 en vol** : seulement le titre et le numéro ; le reste (sous-titre, pastille, onglets 1/2/3, flèche, animation) apparaît une fois posées ; l'animation ne démarre qu'à l'arrivée. Une fois posées elles ne bougent plus (sauf scroll inverse).
- **Textes** : tous les mots du message commencent par une majuscule ; titres de cartes en Cormorant.
- **Éléments refusés** : photo/texte qui glisse latéralement, grain, tableau géant (essayé), formulaire à plusieurs champs (remplacé par un bouton Contact).

## 5. Comment ça marche (app.js)
- **Thème de fond** : `COL` (couleurs par `data-bg`), `TRIG`, transitions via variables CSS `--pbg`, `--fg`… (enregistrées avec `@property`). Classe `is-light` sur `<html>`.
- **Séquence du message** : `seq()` calcule `tt` (position de `#text`, divisée par 0,7 sur téléphone), `tq`, `A` (apparition des cartes), `WP` (trajet des mots), puis `kick()` lance la boucle `step()`.
- **Cartes en vol** (`fl`, éléments `.fc`) : cible `f.tgt` ; la carte est épinglée à `k.y` et ne descend jamais plus bas ; elle s'ajuste en x / taille / rotation pendant que son emplacement monte, puis elle est remplacée par la carte d'emplacement `.sc` quand `te>=.995 && dd<=1` (classe `.go` ajoutée → démarre l'animation).
- **Robustesse iOS** : `onS()` et `kick()` ont un filet `setTimeout` + détection de boucle bloquée (le navigateur de l'iPhone peut abandonner des `requestAnimationFrame`).
- **Cartes Services** : `kcard(i)` génère le contenu (titre/sous-titre + zone animée + numéro). La zone animée vient de `cartes-interactions.js`/`.css` (fichiers autonomes fournis par Jason, à ne pas réécrire à la main) : `MeduzaViz.html(i)` fournit le HTML, `MeduzaViz.watch(carte,{landed})` démarre la surveillance (boucle 8-9s, pause si hors écran ou si la carte n'est pas encore posée), `MeduzaViz.setLanded(carte,bool)` est appelé dans `kick()`/`step()` quand la classe `.go` est ajoutée/retirée aux cartes 01/02. Contenu à adapter avant mise en ligne : noms/compteurs du Reel (exemples), le « m » du logo Meduza dans le clavier (variable `--mkm` du CSS, à remplacer par le vrai logo vectoriel).
- **Titre « Eux se ressemblent »** : IIFE `#intro` — `pick()` choisit l'image visible (`.whyimg .img` ≥ 1024 px, `.why .img` en dessous), `fit()` place le titre sur le bas de l'image (décalage −30 px ordinateur, +8 px téléphone) et fixe le `top` collant de `#pts` (hauteur du titre + 150 px), `clip()` affiche la copie blanche du titre (`h2.w`) découpée sur le rectangle de l'image, `hid()` efface `#pts` quand la première carte projet l'atteint. Piège connu : ne jamais mesurer la position d'un élément `sticky` pour calculer sa place d'origine (mesurer son conteneur `.pstack`).
- **Tableau** : un `IntersectionObserver` ajoute/retire `.on` ligne par ligne ; la colonne bordeaux (`.hl`) est un bloc fixe ; croix et coches des deux colonnes apparaissent en même temps (délai identique).
- **FAQ / onglets** : `setTab(i)` change la photo seulement au clic (le suivi au scroll est désactivé : `spyFaq` vide). Ordinateur : `.faq-r` collé, `.faq-l` défile. Téléphone : onglets collés, photo sous les onglets (`.faq-l{display:contents}`).
- **Contact** : `WA_NUMBER` vide dans `app.js` → les boutons `[data-wa]` pointent vers `wa.me/?text=…` ; **renseigner le numéro**.
- **Points de rupture** : 1024 (ordinateur : image du titre à gauche, tableau seul), 860 (FAQ deux colonnes), 760 (carte contact), 700 (accélération du message sur téléphone).

## 6. À fournir / à décider
- Numéro WhatsApp (`WA_NUMBER`).
- Images projets (fond + capture) pour Zafer, boun_in_mauritius, Chocolaterie Coutant (`project-1` a une photo de test temporaire, un pion d'échecs, à remplacer) ; photos `about-2` (L'offre) et `about-3` (La garantie).
- Vrais logos : bandeau Audience (8 emplacements, aujourd'hui des noms) ; **icône de Zafer** (aujourd'hui un « Z » provisoire) ; logo vectoriel Meduza pour `cartes-interactions.css` (variable `--mkm`).
- **Témoignage** : la citation est un brouillon écrit par Claude et attribué à Loïc (Proh2o Réunion) → à faire valider ou remplacer par ses vrais mots ; la bulle utilise un recadrage de la photo du hero.
- **Carte « Convaincre »** (clavier/Reel) : noms (lea.m, ravi_mu, ines), messages et compteurs (1 284 J'aime, 86 commentaires) sont des exemples fournis avec `cartes-interactions.js`, pas des résultats réels.
- Vérifier : orthographe de `boun_in_mauritius`, chiffres (Zafer 6 000 téléchargements / 3 500 inscrits / 450 000 annonces vues ; 12 000 followers ; +40 ventes), textes de la FAQ et du pied de page.
- Largeurs de tablette 860–1023 px : l'image du tableau reste à côté du tableau (ancien comportement), à reprendre si besoin.
- Non testé sur un vrai iPhone (tests faits dans Chrome sans interface, ordinateur 1440×900 et téléphone 393×798).
- Voir §0 pour le point en suspens au moment de la bascule vers le cloud (demande leboncoin / drag-and-drop photo).
