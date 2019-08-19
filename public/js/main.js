//main.js
// ecmascript 2016
// "strict": "error"
"strict mode"
//kazdych 1000ms odosle telegram do servera
const SR_TX_TIMING = 100
const SR_RX_TIMING = 100
//telegram odosielany do Arduina
var tx_msg = {
  // povel otvorit garaz
  gar_on: false,
  // povel zastavit garaz
  gar_stop: false,
  // povel zatvorit garaz
  gar_off: false,
  // povel zapnut svetla
  lit_on: false,
  // povel vypnut svela
  lit_off: false,
  // povel svetlo automat
  lit_aut: false,
  // povel zmenit nastavenie teploty
  tem_set: false,
  // hodnota nastavenej teploty
  tem_spt: 0
}
// ak sa nieco zmenilo v poveloch pre arduino
var cmd_set = false
//funkcia pre osetrenie POST dotazu
function postData(url = ' ', data = {}) {
  // Default options are marked with *
  return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, *same-origin, omit
      headers: {
        /*globals csrf:true*/
        "csrf-token": csrf,
        "Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()) // parses response to JSON
}
//kazdu sekundu odosli telegram s prikazmi do servera
setInterval(() => {
  //ak chceme nieco v arduine zmenit
  if (cmd_set) {
    //vynuluj poziadavku na zmenu
    cmd_set = false
    //odosli dotaz na server so zakodovanim JSON tx_msg
    postData('/tx', tx_msg)
      .then(data => console.log("/tx data > ", data)) // JSON-string from `response.json()` call
      .catch(error => {
        console.error(error)
      })
    //po odoslani vynuluj vsetky poziadavky
    // povel otvorit garaz
    tx_msg.gar_on = false
    // povel otvorit garaz
    tx_msg.gar_stop = false
    // povel zatvorit garaz
    tx_msg.gar_off = false
    // povel zapnut svetla
    tx_msg.lit_on = false
    // povel vypnut svela
    tx_msg.lit_off = false
    // povel svetlo automat
    tx_msg.lit_aut = false
    // povel zmenit nastavenie teploty
    tx_msg.tem_set = false
    //pozadovana teplota setpoint
    tx_msg.tem_spt = 0
  }
  //toto opakuj kazdu sekundu ak mas co poslat
}, SR_TX_TIMING)
//telegram prijimany z Arduina, vsetky feedbacky z arduina
var rx_msg = {
  //feedback garaz otvorena
  gar_on: false,
  //feedback garaz zatvorena
  gar_off: false,
  //feedback garaz zastavena
  gar_stop: false,
  //feedback svetla zapnute
  lit_on: false,
  //feedback svetla vypnute
  lit_off: false,
  //feedback svetla automat
  lit_aut: false,
  //feedback nastavena teplota
  tem_spt: 0,
  //feedback aktualna teplota
  tem_act: 0,
  //feedback aktualny osvit
  amb_lit: 0
}
//nacitanie dat zo servera
function loadRxData() {
  fetch('/rx')
    .then(response => {
      return response.json()
    })
    .then(data => {
      Object.keys(data).forEach(key => {
        if (rx_msg.hasOwnProperty(key))
          rx_msg[key] = data[key]
      })
      //console.log('rx_msg >> changed ', rx_msg)
    })
}
//kazdu sekundu nacitaj stav z arduina
setInterval(() => {
  //odosli dotaz na server so aby poslal JSON rx_msg
  loadRxData()
  //nacitane data umiestni do HTML objektov
  redrawPage()
  //toto opakuj kazdu sekundu ak mas co poslat
}, SR_RX_TIMING)
//------------------------------------------------------------------------------
// DOM
//------------------------------------------------------------------------------
// aktualizuje hodnoty v html tagoch
function redrawPage() { // eslint-disable-line no-unused-vars
  Object.keys(rx_msg).forEach(key => {
    let $el = $('#' + key)
    $el.val(rx_msg[key])
  })

  let farba1 = "#ddd"
  let farba2 = "red"
  if(rx_msg.lit_aut){ 
    $("#litAut").css("backgroundColor",farba2)
  }else{ 
    $("#litAut").css("backgroundColor",farba1)
  }

  if(rx_msg.gar_on){ 
    $("#otvGar").css("backgroundColor",farba2)
  }else{
    $("#otvGar").css("backgroundColor",farba1)
  }
 
  if(rx_msg.gar_off){ 
    $("#zatGar").css("backgroundColor",farba2)
  }else{ 
    $("#zatGar").css("backgroundColor",farba1)
  }

  if(rx_msg.lit_on){ 
    $("#litOn").css("backgroundColor",farba2)
  }else{ 
    $("#litOn").css("backgroundColor",farba1)
  }

  if(rx_msg.lit_off){ 
    $("#litOff").css("backgroundColor",farba2)
  }else{ 
    $("#litOff").css("backgroundColor",farba1)
  }
}
// nacita data zo servera
/*eslint no-unused-vars: "error"*/
function refreshPage() { // eslint-disable-line no-unused-vars
  loadRxData()
}
// povel na zapnutie svetla
function doLightOn() { // eslint-disable-line no-unused-vars
  //zapnut svetla
  tx_msg.lit_on = true
  //vykonaj
  cmd_set = true
}
// povel na vypnutie svetla
function doLightOff() { // eslint-disable-line no-unused-vars
  //vypnut svela
  tx_msg.lit_off = true
  //vykonaj
  cmd_set = true
}
// povel na vypnutie svetla
function doLightAut() { // eslint-disable-line no-unused-vars
  //vypnut svela
  tx_msg.lit_aut = true
  //vykonaj
  cmd_set = true
}
// povel na otvorenie garaze
function doGarageOpen() { // eslint-disable-line no-unused-vars
  //otvorit garaz
  tx_msg.gar_on = true
  //vykonaj
  cmd_set = true
}
// povel na zatvorenie garaze
function doGarageClose() { // eslint-disable-line no-unused-vars
  //zatvorit garaz
  tx_msg.gar_off = true
  //vykonaj
  cmd_set = true
}
// povel na zatvorenie garaze
function doGarageStop() { // eslint-disable-line no-unused-vars
  //zatvorit garaz
  tx_msg.gar_stop = true
  //vykonaj
  cmd_set = true
}
// nastavit setpoint
function doTempSet() { // eslint-disable-line no-unused-vars
  let $el = $('#in_tem_spt')
  let num = $el.val()
  if (!isNaN(num)) {
    if (num < 0) {
      num = 0
    }
    if (num > 50) {
      num = 50
    }
  } else {
    num = 25
  }
  $el.val(num)
  //pozadovana teplota chcem zamenit
  tx_msg.tem_set = true
  //pozadovana teplota setpoint
  tx_msg.tem_spt = Number(num)
  //vykonaj
  cmd_set = true
}
