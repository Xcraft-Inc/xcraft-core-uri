# 📘 xcraft-core-uri

## Aperçu

`xcraft-core-uri` est une librairie utilitaire de l'écosystème Xcraft qui fournit des fonctions de résolution et de conversion d'URI. Elle permet de traduire des schémas d'URI spécifiques à Xcraft (`chest:`, `self:`, `home:`) vers des URI standards (`http:`, `https:`, `file:`) exploitables par le reste de l'application, ainsi que de résoudre le chemin d'un package sur le système de fichiers.

## Sommaire

- [Aperçu](#aperçu)
- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)
- [Licence](#licence)

## Structure du module

Le module expose un seul fichier source, `index.js`, qui contient deux fonctions publiques :

- **`packageDefDir(packageName)`** — calcule le chemin absolu du dossier d'un package Xcraft.
- **`realUri(uri, packageName)`** — convertit une URI utilisant un schéma spécifique à Xcraft en une URI standard.

Ce module ne définit ni acteur, ni widget, ni fichier de configuration `config.js`. Il s'agit d'une pure librairie utilitaire, sans état et sans dépendance à l'infrastructure d'acteurs Elf/Goblin.

## Fonctionnement global

Xcraft utilise en interne des schémas d'URI personnalisés afin d'abstraire l'emplacement réel des ressources, qu'il s'agisse de fichiers locaux, de fichiers relatifs à un package, ou de ressources distribuées par le service **chest** (un service de distribution de ressources binaires). `realUri` prend en entrée une de ces URI et retourne l'URI réelle correspondante, en s'appuyant sur la configuration globale Xcraft (`xcraft-core-etc`) pour connaître les chemins racines et les paramètres du service chest.

Trois schémas sont reconnus :

1. **`chest:[//<host>[:<port>]/]<resource>`** — désigne une ressource distribuée par le service chest. La fonction construit une URI `http:` ou `https:` (selon le port, 443 impliquant `https:`) pointant vers `/resources/<resource>` sur l'hôte du service chest. Si l'URI d'entrée précise déjà un hôte et un port, ceux-ci sont utilisés à la place de la configuration par défaut du module `xcraft-contrib-chest`.
2. **`self:///path`** — désigne un chemin relatif au package lui-même (contenu embarqué). La fonction construit une URI `file:` pointant vers `<pkgProductsRoot>/<packageName>/path`.
3. **`home:///path`** — désigne un chemin relatif au dossier `home` de l'installation Xcraft. La fonction construit une URI `file:` pointant vers `<xcraftRoot>/home/path`.

Si le schéma de l'URI d'entrée ne correspond à aucun de ces trois cas, l'URI est retournée telle quelle, sans transformation.

`packageDefDir` est une fonction complémentaire plus simple : elle retourne le chemin `<pkgProductsRoot>/<packageName>`, c'est-à-dire l'emplacement où sont déployés les fichiers d'un package Xcraft donné.

## Exemples d'utilisation

```javascript
const xUri = require('xcraft-core-uri');

// Résoudre le chemin de définition d'un package
const dir = xUri.packageDefDir('my-package');
// => "<pkgProductsRoot>/my-package"

// Convertir une URI "self:" vers une URI de fichier réelle
const fileUri = xUri.realUri('self:///assets/logo.png', 'my-package');
// => "file://<pkgProductsRoot>/my-package/assets/logo.png"

// Convertir une URI "home:" vers une URI de fichier réelle
const homeUri = xUri.realUri('home:///config/settings.json', 'my-package');
// => "file://<xcraftRoot>/home/config/settings.json"

// Convertir une URI "chest:" vers une URI HTTP
const httpUri = xUri.realUri(
  'chest://cdn.example.com:8080/icon.svg',
  'my-package'
);
// => "http://cdn.example.com:8080/resources/icon.svg"
```

## Interactions avec d'autres modules

- **[xcraft-core-etc]** — utilisé pour charger la configuration globale `xcraft` (notamment `pkgProductsRoot` et `xcraftRoot`) ainsi que la configuration `xcraft-contrib-chest` (hôte et port par défaut du service chest). Ce module est requis dynamiquement, à l'intérieur des fonctions, afin d'éviter les dépendances circulaires au chargement.
- Le service **chest** (non inclus dans ce module) est référencé indirectement via sa configuration, pour la résolution des URI de type `chest:`.

Ce module est typiquement consommé par d'autres modules Xcraft ayant besoin de résoudre des chemins de ressources ou de packages sans connaître les détails de la configuration d'installation (emplacement des packages, dossier home, service chest).

## Détails des sources

### `index.js`

Fichier unique du module, contenant les deux fonctions exportées.

#### Méthodes publiques

- **`packageDefDir(packageName)`** — Retourne le chemin absolu du dossier de production d'un package, en joignant `pkgProductsRoot` (issu de la configuration `xcraft`) avec le nom du package fourni. Utile pour localiser sur le disque les fichiers déployés d'un package Xcraft.
- **`realUri(uri, packageName)`** — Analyse l'URI fournie et, selon son protocole, retourne une URI réelle transformée :
  - pour `chest:`, construit une URI HTTP/HTTPS vers le service de distribution de ressources ;
  - pour `self:`, construit une URI `file:` relative au dossier du package ;
  - pour `home:`, construit une URI `file:` relative au dossier home de l'installation Xcraft ;
  - pour tout autre protocole, retourne l'URI d'entrée sans modification. Le paramètre `packageName` n'est utilisé que pour la résolution du schéma `self:`.

## Licence

Ce module est distribué sous [licence MIT](./LICENSE).

_Ce contenu a été généré par IA_

---

[xcraft-core-etc]: https://github.com/Xcraft-Inc/xcraft-core-etc
