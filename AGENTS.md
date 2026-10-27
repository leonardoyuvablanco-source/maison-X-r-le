# AGENTS.md — notes d'environnement (Base44)

## Ce qu'est ce projet

Un site statique en français (pages HTML à la racine, une par écran) **plus** une petite
API Node/Express qui alimente le chat de la page d'accueil (`index.html.html`, qui appelle
`POST /chat`).

Le code du serveur était fourni dans `server.js.html` (un fichier `.js` enregistré en HTML) :
il a été remis dans `server.js` à la racine, avec la clé OpenAI lue depuis
`process.env.OPENAI_API_KEY` au lieu d'être écrite en dur.

## Lancer le projet

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- Un seul service `web` (image `node:22`) : `npm install` puis `npm run dev`
  (`node --watch server.js`), donc les modifications de `server.js` rechargent le serveur
  et les fichiers HTML sont servis tels quels depuis le montage du dépôt.
- Le site ET l'API partagent le port **3000** (une seule origine) : le chat appelle `/chat`
  en chemin relatif. Ne pas repasser en URL absolue `http://localhost:3000/chat`, elle
  serait résolue sur la machine du visiteur et non sur le serveur.
- `GET /` sert `index.html.html` (Express ne connaît que `index.html` comme page par
  défaut). Les autres pages sont accessibles par leur nom de fichier, par ex.
  `/Pagennn234.html`, `/Connexion.html`, `/support.html`, `/securite.html`.

## À savoir

- Certains fichiers HTML sont encodés en Latin-1 (ISO-8859-1) et déclarent ce charset :
  les modifier avec des outils qui réécrivent en UTF-8 abîme les accents. Les retouches
  faites ici l'ont été avec `sed` (octet par octet).
- Les noms de fichiers contiennent des espaces, accents, `@`, `°`, `#` : `#` ne peut pas
  être demandé tel quel dans une URL (fragment), donc certains liens du menu sont déjà
  cassés à l'origine (`profil.html`, `pagen2etitleo.html`, `parametres.html` n'existent pas).
- `OPENAI_API_KEY` n'est pas nécessaire au démarrage, seulement au bon fonctionnement du
  chat. Elle arrive via `/run/base44/app.env`.

## Vérifier

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/        # 200
curl -s -X POST http://localhost:3000/chat -H 'Content-Type: application/json' \
  -d '{"message":"bonjour"}'                                           # {"reply":"..."}
```

Le second appel dépend de la clé OpenAI (sans clé valide : `502` avec un message d'erreur).
