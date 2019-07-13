# pi_server

Projekt bol vytvorený v prostredí **PlatformIO IDE**. Najprv bol vyvíjaný v multifunkčnom editore **Atom**. Kedže Atom v čase vývoja mal množstvo bugov, plynule vývoj prešiel do prostredia **Vscode** aj napriek výhradám v politike firmy Microsoft, ktorá je tvorcom prostredia Vscode. Musím uznať, že Vscode je špičkový software. Umožňuje integrovať množstvo nástrojov a užitočných doplnkov pre urýchlenie vývoja.

## Quick start

Je úplne jedno či pracujeme pod Linuxom alebo Windowsom. Ja osobne preferujem Ubuntu linux, môj syn fachčí pod Arch linuxom. Systém Windows postupne opúšťam, nakoľko ma nebaví čakať na "samoinštalácie" tohto spotvoreného systému.

V každom prípade na začiatok je potrebné mať nainštalované nejaké užitočné tools-y:
* **Nodejs** [nodejs](https://nodejs.org/en/download/) s doplnkom **Npm** [npm](https://www.npmjs.org/)
* **Git** version control system [git](https://git-scm.com/)
* **IDE** vývojové prostredie napr. [vscode](https://code.visualstudio.com/)

archlinux:
```sh
pacman -S nodejs npm git
yay -S vscodium-bin
```

Potom je potrebné v do home adresára v užívateľskom prístupe **(v žiadnom prípade nie ako root !)** naklonovať projekt.

Predpokladám, že funguješ v linuxe.
Otvor terminál

[Clone](https://github.com/risapav/pi_server)

ubuntu:
```sh
git clone https://github.com/risapav/pi_server && cd pi_server && npm install
```

archlinux:
```sh
git clone https://github.com/risapav/pi_server && cd pi_server && npm install
yay -S vscodium-bin
```

Nakoniec vojdi do projektu a spusti aplikaciu nasledovne:
```sh
~/pi_server$ ./runme.sh
```


-- koniec --
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
