# pi_server

Projekt bol vytvorený v prostredí **PlatformIO IDE**. Najprv bol vyvíjaný v multifunkčnom editore **Atom**. Kedže Atom v čase vývoja mal množstvo bugov, plynule vývoj prešiel do prostredia [Vscode](https://code.visualstudio.com/) aj napriek výhradám v politike firmy Microsoft, ktorá je tvorcom prostredia Vscode. Musím uznať, že Vscode je špičkový software. Umožňuje integrovať množstvo nástrojov a užitočných doplnkov pre urýchlenie vývoja.

## Quick start

Je úplne jedno či pracujeme pod Linuxom alebo Windowsom. Ja osobne preferujem Ubuntu linux, môj syn fachčí pod Arch linuxom. Systém Windows postupne opúšťam, nakoľko ma nebaví čakať na "samoinštalácie" tohto spotvoreného systému.

V každom prípade na začiatok je potrebné mať nainštalované nejaké užitočné tools-y:
* [nodejs](https://nodejs.org/en/download/) s doplnkom [npm](https://www.npmjs.org/)
* version control system [git](https://git-scm.com/)
* vývojové prostredie napr. [vscode](https://code.visualstudio.com/)

archlinux:
```sh
pacman -S nodejs npm git
yay -S vscodium-bin
```

Potom je potrebné do home adresára v užívateľskom prístupe **(v žiadnom prípade nie ako root !)** naklonovať [projekt](https://github.com/risapav/pi_server)

Predpokladám, že funguješ v linuxe.
Otvor terminál a inštaluj aplikáciu nasledovne:

ubuntu:
```sh
git clone https://github.com/risapav/pi_server && cd pi_server && npm install
```

archlinux:
```sh
git clone https://github.com/risapav/pi_server && cd pi_server && npm install
```

Nakoniec vojdi do projektu a spusti aplikaciu nasledovne:
```sh
~/pi_server$ ./runme.sh
```

## Guide to application

Aplikácia je napísaná v javascripte a je určená pre spustenie pod nodejs. Na spustenie je pripravený bash script runme.sh . Javascript je použitý podľa syntaxe ECMA 2016

As a general rule, be sure to read through all of the source code yourself and make sure you understand what is happening.

| Directories          | Purpose                    |
| :------------------- | :------------------------- |
| [.vscode](./.vscode) | IDE editor config          |
| [public](./public)   | FrontEnd application files |
| [src](./src)         | Backend application files  |
| [views](./views)     | Handlebars templates       |

```yaml
public:
    │
    ├── css:
    │   └── default.css
    └── js:
        └── jquery-3.3.1.min.js
            main.js
src:
    │
    └── app.js
        telegram.js
views
    │
    └── index.hbs
```
