//main.js
'use strict';
//kazdych 1000ms odosle telegram do servera
const SR_TX_TIMING = 1000
const SR_RX_TIMING = 1000
//konstanty pre kodovanie povelu pre Arduino
const CMD = {
  GAR_ON: 0x0001,
  GAR_OFF: 0x0002,
  LIT_ON: 0x0004,
  LIT_OFF: 0x0008,
  TEM_SET: 0x0010
}
//telegram odosielany do Arduina
var tx_msg = {
  //otvorit garaz
  gar_on: false,
  //zatvorit garaz
  gar_off: false,
  //zapnut svetla
  lit_on: false,
  //vypnut svela
  lit_off: false,
  //pozadovana teplota chcem zamenit
  tem_set: false,
  //pozadovana teplota setpoint
  tem_spt: 0
};
// ak sa nieco zmenilo v poveloch pre arduino
var cmd_set = false;
//kazdu sekundu odosli telegram s prikazmi do servera
setInterval(() => {
  //ak chceme nieco v arduine zmenit
  if (cmd_set) {
    //vynuluj poziadavku na zmenu
    cmd_set = false;
    //odosli dotaz na server so zakodovanim JSON tx_msg
    //----------------------------------------------------
    /*
        var xxx = fetch('/tx', {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(tx_msg), // data can be `string` or {object}!
            headers: {
              "csrf-token": csrf,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
          .then(response => console.log('Success:', JSON.stringify(response)))
          .catch(error => console.error('Error:', error));

        console.log('xxx> ', xxx);
    */
    //---------------------------------------------------

    postData('/tx', tx_msg)
      //      .then(data => console.log("/tx data > ", data)) // JSON-string from `response.json()` call
      .catch(error => {
        console.error(error, tx_msg);
      });

    function postData(url = ' ', data = {}) {
      // Default options are marked with *
      return fetch(url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, cors, *same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "include", // include, *same-origin, omit
          headers: {
            "csrf-token": csrf,
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
          },
          redirect: "follow", // manual, *follow, error
          referrer: "no-referrer", // no-referrer, *client
          body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
        .then(response => response.json()); // parses response to JSON
    }

    //po odoslani vynuluj vsetky poziadavky
    //otvorit garaz
    tx_msg.gar_on = false;
    //zatvorit garaz
    tx_msg.gar_off = false;
    //zapnut svetla
    tx_msg.lit_on = false;
    //vypnut svela
    tx_msg.lit_off = false;
    //pozadovana teplota chcem zamenit
    tx_msg.tem_set = false;
    //pozadovana teplota setpoint
    tx_msg.tem_spt = 0;
  }
  //toto opakuj kazdu sekundu ak mas co poslat
}, SR_TX_TIMING);
//telegram prijimany do Arduina
var rx_msg = {
  //feedback garaz otvorena
  gar_on: false,
  //feedback garaz zatvorena
  gar_off: false,
  //feedback svetla zapnute
  lit_on: false,
  //feedback svetla vypnute
  lit_off: false,
  //feedback nastavena teplota
  tem_spt: 0,
  //feedback aktualna teplota
  tem_act: 0,
  //feedback aktualny osvit
  amb_lit: 0
};
//nacitanie dat zo servera
function load_rx_data() {
  fetch('/rx')
    .then(response => {
      return response.json();
    })
    .then(data => {
      Object.keys(data).forEach(key => {
        if (rx_msg.hasOwnProperty(key))
          rx_msg[key] = data[key];
      });
      //console.log('rx_msg >> changed ', rx_msg);
    });
}
//kazdu sekundu nacitaj stav z arduina
setInterval(() => {
  //odosli dotaz na server so aby poslal JSON rx_msg
  load_rx_data();
  redrawPage();
  //toto opakuj kazdu sekundu ak mas co poslat
}, SR_RX_TIMING);
//------------------------------------------------------------------------------
// DOM
//------------------------------------------------------------------------------
// aktualizuje hodnoty v html tagoch
function redrawPage() {
  Object.keys(rx_msg).forEach(key => {
    let $el = $('#' + key);
    $el.val(rx_msg[key]);
  });
}
// nacita data zo servera
function refreshPage() {
  load_rx_data();
}
// povel na zapnutie svetla
function do_lit_on() {
  //zapnut svetla
  tx_msg.lit_on = true;
  //vykonaj
  cmd_set = true;
}
// povel na vypnutie svetla
function do_lit_off() {
  //vypnut svela
  tx_msg.lit_off = true;
  //vykonaj
  cmd_set = true;
}
// povel na otvorenie garaze
function do_gar_on() {
  //otvorit garaz
  tx_msg.gar_on = true;
  //vykonaj
  cmd_set = true;
}
// povel na zatvorenie garaze
function do_gar_off() {
  //zatvorit garaz
  tx_msg.gar_off = true;
  //vykonaj
  cmd_set = true;
}
// nastavit setpoint
function do_tem_set() {
  let $el = $('#in_tem_spt');
  let num = $el.val();
  if (isNaN(num)) {
    num = 20;
    $el.val(num);
  }
  if (num < 0) {
    num = 0;
  }

  if (num > 50) {
    num = 50;
  }

  $el.val(num);
  //pozadovana teplota chcem zamenit
  tx_msg.tem_set = true;
  //pozadovana teplota setpoint
  tx_msg.tem_spt = num;
  //vykonaj
  cmd_set = true;
}