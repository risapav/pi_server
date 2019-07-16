# pi_server

Pi_server projekt bol vytvorený ako súčasť školského projektu "Smart Home". Cieľom celého projektu bolo demonštrovať použitie modulov Arduino na riadenie zariadení v domácnosti. Dielčia časť Pi_server rieši HTTP komunikáciu užívateľa a komunikuje s Arduinom cez sériovú linku. Odosiela povely a tiež monitoruje stav ovládaných periférií.

## Predslov
Projekt bol vytvorený v prostredí [PlatformIO IDE](https://platformio.org/). Najprv bol vyvíjaný v multifunkčnom editore [Atom](https://atom.io/). Kedže Atom v čase vývoja mal množstvo bugov, plynule vývoj prešiel do prostredia [Vscode](https://code.visualstudio.com/), aj napriek výhradám voči politike firmy Microsoft, ktorá je tvorcom prostredia Vscode. Musím uznať, že Vscode je špičkový software. Umožňuje integrovať množstvo nástrojov a užitočných doplnkov pre urýchlenie vývoja rôznych typov aplikácií.

## Quick start

Je úplne jedno či pracujeme pod Linuxom alebo Windowsom. Ja osobne preferujem Ubuntu linux, môj syn fachčí pod Arch linuxom. Systém Windows postupne opúšťam, nakoľko ma nebaví čakať na "samoinštalácie" tohto spotvoreného systému.

V každom prípade na začiatok je potrebné mať nainštalované nejaké užitočné tools-y:
* [nodejs](https://nodejs.org/en/download/) s doplnkom [npm](https://www.npmjs.org/)
* version control system [git](https://git-scm.com/)
* vývojové prostredie napr. [vscode](https://code.visualstudio.com/)

### Inštalácia tools
archlinux:
```sh
pacman -S nodejs npm git
yay -S vscodium-bin
```

ubuntu:
```sh
sudo apt update
sudo apt install nodejs npm git

sudo apt install software-properties-common apt-transport-https wget

wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main"

sudo apt update
sudo apt install code
```

Potom je potrebné do home adresára v užívateľskom prístupe **(v žiadnom prípade nie ako root !)** naklonovať [projekt](https://github.com/risapav/pi_server)

Predpokladám, že funguješ v linuxe.
Otvor terminál a inštaluj aplikáciu nasledovne:

linux:
```sh
cd ~
git clone https://github.com/risapav/pi_server && cd pi_server && npm install
```
Následne je vhodné aktualizovať knižnice na aktuálne verzie
```sh
cd ~/pi_server
$ npx npm-check-updates -u
$ npm install 
```

Nakoniec vojdi do projektu a spusti aplikaciu nasledovne:
```sh
cd ~/pi_server
~/pi_server$ ./runme.sh
```

## Guide to application

Aplikácia je napísaná v javascripte a je určená pre spustenie pod nodejs. Na spustenie je pripravený bash script runme.sh . Javascript je použitý podľa syntaxe ECMA 2016

As a general rule, be sure to read through all of the source code yourself and make sure you understand what is happening. Potrebné poznámky o algoritme sú vpísané do zdrojových textov.

| Directories          | Purpose                    |
| :------------------- | :------------------------- |
| [.vscode](./.vscode) | IDE editor config          |
| [public](./public)   | FrontEnd application files |
| [src](./src)         | Backend application files  |
| [views](./views)     | Handlebars templates       |

Schema súborov a adresárov v projekte:
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
views:
    │
    └── index.hbs
```
