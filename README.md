# pi_server

Projekt bol vytvorený v prostredí PlatformIO IDE. Najprv bol vyvíjaný v multifunkčnom editore Atom. Kedže Atom v čase vývoja mal množstvo bugov, plynule vývoj prešiel do prostredia Vscode aj napriek výhradám v politike firmy Microsoft, ktorá je tvorcom prostredia Vscode. Musím uznať, že Vscode je špičkový software. Umož\uje integrovať množstvo nástrojov a užitočných doplnkov pre urýchlenie vývoja.

## Quick start

Na začiatok je potrebné mať nainštalovaný program git. Je úplne jedno či pracujeme pod Linuxom alebo Windowsom. Ja osobne preferujem Ubuntu linux, môj syn fachčí pod Arch linuxom. Systém Windows postupne opúšťam, nakoľko ma nebaví čakať na "samoinštalácie" tohto spotvoreného systému.

Predpokladám, že funguješ v linuxe.

Takže najprv nainštaluj GIT:

Otvor terminál



[Clone](https://github.com/risapav/emb_web_app)

```sh
git clone https://github.com/risapav/emb_web_app && cd emb_web_app && npm install
```

Make sure [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/) are
[installed](http://nodejs.org/download/).


Install the dependencies.
```sh
npm install
```

## Guide

There are additional `README.md` files all throughout the application. However, the documentation is a work in progress.

As a general rule, be sure to read through all of the source code yourself and make sure you understand what is happening.

| Directories          | Purpose               |
| :------------------- | :-------------------- |
| [.vscode](./.vscode) | IDE editor config     |
| [build](./build)     | Webpack configuration |
| [src](./src)         | Javascript App Files  |


## Usage

Once installed, you can start writing modern ES6-flavored JavaScript apps right away:
```yaml
src:
    ├── assets:
    │   └── images:
    │       └── logo.png
    │
    ├── css:
    │   └── main.css
    │
    └── sass:
    │   └── styles.scss
    │
    └─  index.html
        index.js
        vendor.js
```
