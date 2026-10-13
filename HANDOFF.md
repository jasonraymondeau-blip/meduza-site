# Meduza — site (wireframe fonctionnel) · passation vers Claude Code

> État au 9 octobre 2026. Site d'une agence digitale à Maurice (sites, apps, campagne de lancement). Fondateur : Jason (côté développement). La partie communication / UGC est tenue par sa conjointe (@boun_in_mauritius).

## 1. Lancer le projet
Site statique, **sans framework** : `index.html` + `style.css` + `app.js` + `assets/`.
- Ouvrir `index.html` dans le navigateur, ou `python3 -m http.server 8000` puis http://localhost:8000
- Vérifier : `pip install playwright && playwright install chromium && python tools/check.py` (erreurs JS + captures ordinateur/téléphone dans `tools/shots/`)
- Version publiée de référence (artifact Claude) : https://claude.ai/artifact/NpLLRCEywj7YTMiqtXbCUJ
- Polices via Google Fonts : Inter (axe `opsz` forcé à 32 = « Inter Display ») + Cormorant Garamond (romain + italique). Réseau requis.

## 2. Structure
```
index.html        balisage des 10 sections
style.css         tout le CSS (variables en tête, puis sections, puis surcharges « test » en bas)
app.js            tout le JS (un seul fichier, IIFE)
assets/           images utilisées par le site (hero, whyus, about-1, avatar, mains, logos masques)
assets/brand/     fichiers d'origine (logos transparents blanc / bordeaux, photos et mains d'origine)
tools/check.py    contrôle rapide
```
Les images du site sont référencées dans `app.js` par la liste `IMAGES` (clés = attribut `data-slot` des blocs). Les logos `--logo` et `--mk` sont en data-URI dans `style.css` (un masque CSS ne marche pas depuis `file://` avec un fichier externe).

## 3. Les sections, dans l'ordre (id / fond)
| Section | id | fond (`data-bg`) | Contenu |
|---|---|---|---|
| Hero | `#top` | msg | Photo plein cadre, titre « AGENCE CRÉATIVE / DIGITALE » (Cormorant), sous-titre. Ordinateur : image large (`hero-wide.jpg`), femme à droite. Téléphone : `hero.jpg`, centrée, remontée de 9 %. |
| Message | `#text` | msg | Texte épinglé « Comme Meduza, Nos Créations Fascinent Avant De Convaincre. » allumé mot à mot ; « Créations » et « Convaincre » partent vers les cartes 01 et 02. |
| Services | `#services` | d2 | 4 cartes verticales (Création, Convaincre, Lancement, Suivi et garantie), chacune avec une animation SVG. 01 et 02 arrivent du message. |
| Pourquoi nous | `#pourquoi-nous` | light | Titre + tableau comparatif Agence classique / Meduza (colonne bordeaux en un bloc, lignes qui apparaissent au scroll). Téléphone : l'image des mannequins est ici, sous le tableau. |
| Réalisations | `#realisations` | light | Ordinateur : image à gauche (`.whyimg`), titre « Eux se ressemblent tous. / Nous, on ne ressemble à personne. » centré, collé en haut, 3 éléments (Zafer, boun_in_mauritius, Chocolaterie Coutant) qui se bloquent 150 px dessous, puis 3 cartes projets empilées. |
| Témoignage | (sans id) | light | Citation en Cormorant italique, bulle ronde. **Texte provisoire.** |
| Qui sommes-nous | `#about` | d2 | Colonne gauche (photo verticale, onglets, « Une question ? ») + FAQ de 6 questions (colonne droite collée, la gauche défile). |
| Audience | `#audience` | d1 | Titre « Votre projet présenté à une vraie audience. » + bandeau de logos qui défile (placeholders). |
| Contact | `#contact` | d2 | Mains qui passent au-dessus d'une carte blanche : ronds en trait, photo de Jason et sa conjointe + « VOUS » en pointillés, bouton « Contact » → WhatsApp. |
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
- **Cartes Services** : `kcard(i)` génère le contenu, `ANIM[i]` le SVG ; animations en CSS (`.a0`…`.a3`), générées par un script puis collées dans `style.css`.
- **Titre « Eux se ressemblent »** : IIFE `#intro` — `pick()` choisit l'image visible (`.whyimg .img` ≥ 1024 px, `.why .img` en dessous), `fit()` place le titre sur le bas de l'image (décalage −30 px ordinateur, +8 px téléphone) et fixe le `top` collant de `#pts` (hauteur du titre + 150 px), `clip()` affiche la copie blanche du titre (`h2.w`) découpée sur le rectangle de l'image, `hid()` efface `#pts` quand la première carte projet l'atteint. Piège connu : ne jamais mesurer la position d'un élément `sticky` pour calculer sa place d'origine (mesurer son conteneur `.pstack`).
- **Tableau** : un `IntersectionObserver` ajoute/retire `.on` ligne par ligne ; la colonne bordeaux (`.hl`) est un bloc fixe ; croix et coches des deux colonnes apparaissent en même temps (délai identique).
- **FAQ / onglets** : `setTab(i)` change la photo seulement au clic (le suivi au scroll est désactivé : `spyFaq` vide). Ordinateur : `.faq-r` collé, `.faq-l` défile. Téléphone : onglets collés, photo sous les onglets (`.faq-l{display:contents}`).
- **Contact** : `WA_NUMBER` vide dans `app.js` → les boutons `[data-wa]` pointent vers `wa.me/?text=…` ; **renseigner le numéro**.
- **Points de rupture** : 1024 (ordinateur : image du titre à gauche, tableau seul), 860 (FAQ deux colonnes), 760 (carte contact), 700 (accélération du message sur téléphone).

## 6. À fournir / à décider
- Numéro WhatsApp (`WA_NUMBER`).
- Images projets (fond + capture) pour Zafer, boun_in_mauritius, Chocolaterie Coutant ; photos `about-2` (L'offre) et `about-3` (La garantie).
- Vrais logos : bandeau Audience (8 emplacements, aujourd'hui des noms) ; **icône de Zafer** (aujourd'hui un « Z » provisoire).
- **Témoignage** : la citation est un brouillon écrit par Claude et attribué à Loïc (Proh2o Réunion) → à faire valider ou remplacer par ses vrais mots ; la bulle utilise un recadrage de la photo du hero.
- Vérifier : orthographe de `boun_in_mauritius`, chiffres (Zafer 6 000 téléchargements / 3 500 inscrits / 450 000 annonces vues ; 12 000 followers ; +40 ventes), textes de la FAQ et du pied de page.
- Largeurs de tablette 860–1023 px : l'image du tableau reste à côté du tableau (ancien comportement), à reprendre si besoin.
- Non testé sur un vrai iPhone (tests faits dans Chrome sans interface, ordinateur 1440×900 et téléphone 393×798).
