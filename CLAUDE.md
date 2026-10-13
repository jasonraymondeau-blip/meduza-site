# CLAUDE.md — instructions pour travailler sur ce projet

Projet : site Meduza (agence digitale à Maurice), statique, sans framework (`index.html`, `style.css`, `app.js`). Lire d'abord `HANDOFF.md`.

## Règles de travail (demandées par Jason)
- Répondre **en français**, simple et direct, **court** (pas de long résumé). Pas d'anglicismes.
- Il donne des retours brefs (« pas convaincu », « trop rouge ») : interpréter et proposer directement une version corrigée, sans questions inutiles. Quand il est fatigué de choisir, décider et lui présenter.
- Toujours **vérifier avant de dire que c'est fait** : lancer `python tools/check.py` et regarder les captures (ordinateur 1440×900 ET téléphone 393×798). Ne pas affirmer ce qui n'a pas été testé (ex. iPhone réel).
- Garder l'ancien comportement quand il dit « comme avant » : annuler précisément le dernier changement, pas plus.

## Interdits / décisions figées
- Pas de lueurs bordeaux (contours blancs), pas de dégradé blanc→noir, pas de séparateurs ou pastilles de section.
- Pas de grain/noise, pas de GSAP, pas de glissement latéral du texte.
- Animations « invisibles » : elles montrent le contrôle (précision, ordre, logique), jamais du spectacle.
- Ne pas inventer de contenu client (citations, chiffres) : signaler tout texte provisoire.

## Pièges techniques
- Un élément `position:sticky` : ne pas mesurer sa position pour retrouver sa place d'origine (utiliser son conteneur).
- Sur iPhone, des `requestAnimationFrame` peuvent être abandonnés : garder les filets `setTimeout` de `onS()` / `kick()`.
- Les styles ajoutés tard dans `style.css` écrasent les anciens : chercher d'abord une règle existante (`grep`) avant d'en ajouter, et se méfier des règles de media query qui écrasent (ex. `.pts`, `.intro h2`).
- Un masque CSS (`mask`) ne charge pas un fichier externe en `file://` : les logos `--logo` / `--mk` restent en data-URI.
- Serveur local : garder le même port d'une modif à l'autre, ne pas en relancer un nouveau à chaque fois.
- Avec Playwright, le cache disque du navigateur peut servir une version périmée de `app.js`/`style.css` même avec `Network.setCacheDisabled` seul : ajouter aussi `Network.clearBrowserCache` avant de naviguer pour être sûr de voir le fichier à jour.
- `cartes-interactions.css`/`.js` (mini-interfaces des cartes Services) sont des fichiers autonomes fournis par Jason : ne pas les réécrire à la main, les traiter comme une librairie externe (voir HANDOFF.md §5).
