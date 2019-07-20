//app.js
// ecmascript 2016
// "strict": "error"
"strict mode"
//konstanty pre komunikovanie s ARDUINOM
//kazdych 1000ms odosle telegram do Arduina
const AR_TX_TIMING = 1000
//konstanty pre kodovanie povelu pre Arduino
const CMD = {
  // povel garaz otvorit
  GAR_ON: 0x0001,
  // povel garaz zatvorit
  GAR_OFF: 0x0002,
  // povel garaz zatvorit
  GAR_STOP: 0x004,
  // povel svetlo zapnut
  LIT_ON: 0x0008,
  // povel svetlo vypnut
  LIT_OFF: 0x0010,
  // povel svetlo automat
  LIT_AUT: 0x0020,
  // povel nastavenie teploty
  TEM_SET: 0x0040
}
//konstanty pre kodovanie feedbacku od arduina
const FBK = {
  // stav garaz otvorena
  GAR_ON: 0x0001,
  // stav garaz zatvorena
  GAR_OFF: 0x0002,
  // stav garaz zatvorena
  GAR_STOP: 0x0004,
  // stav zapnutie svetla
  LIT_ON: 0x0008,
  // stav vypnutie svetla
  LIT_OFF: 0x0010,
  // stav svetlo v automate
  LIT_AUT: 0x0020,

  // stav kurenie zapnute
  HEAT_ON: 0x0080,
  // stav chladenie zapnute
  COOL_ON: 0x0100,
  // stav ochrana zapnuta
  SAFE_ON: 0x0200,
  // stav rele_0
  RELE_0: 0x0400,
  // stav rele_1
  RELE_1: 0x0800,
  // stav rele_2
  RELE_2: 0x1000,
  // stav rele_3
  RELE_3: 0x2000,
  // stav rele_4
  RELE_4: 0x4000,
  // stav rele_5
  RELE_5: 0x8000
}
// ak sa nieco zmenilo v poveloch pre arduino, true pre odoslanie do arduina
var cmd_set = false
//telegram odosielany do Arduina
var tx_msg = {
  // povel otvorit garaz
  gar_on: false,
  // povel zatvorit garaz
  gar_off: false,
  // povel zastavit garaz
  gar_stop: false,
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
//telegram prijimany z Arduina, vsetky feedbacky z arduina
var rx_msg = {
  //feedback garaz otvorena
  gar_on: false,
  //feedback garaz zatvorena
  gar_off: false,
  // povel zastavit garaz
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
  amb_lit: 0,
  //rele_0
  rele_0: false,
  //rele_1
  rele_1: false,
  //rele_2
  rele_2: false
}

// word setpoint teplota
const _STM = 0
// word actual teplota
const _ATM = 1
// word actual osvitu
const _ATB = 2
// setpoint word
const _STP = 6
// status word
const _STA = 7
// feedback word
const _FDB = 8
// command word
const _CMD = 9
//------------------------------------------------------------------------------
// KOMUNIKACIA S ARDUINOM
//------------------------------------------------------------------------------
//zavolanie komunikacnych kniznic
//import SerialPort from 'serialport'
const SerialPort = require('serialport')
//import * as SerialPort from 'serialport.js';
const Readline = require('@serialport/parser-readline')
const {
  Telegram
} = require('./telegram')
//import Telegram from './telegram'
//nastavenie prenosu po seriovej linke pre komunikovanie s arduinom
const init_arduino_communication = () => {
  //cesta ku seriovemu portu
  let comport = ''
  //priprav seriovu komunikaciu nezavisle na platforme a os
  //console.log(process.platform)
  if (process.platform === "win32") { // pre WINDOWS
    comport = 'COM7'
  } else { // pre LINUX
    comport = '/dev/ttyACM0'
  }
  //urob listing vsetkych portov
  SerialPort.list().then(
    ports => ports.forEach(console.log),
    err => console.error(err)
  )
  // otvor a nastav seriovy port
  console.log('pripravený port: ', comport)
  const port = new SerialPort(comport, {
    baudRate: 115200
  }, err => {
    if (err) {
      return console.log('Error: ', err.message)
    }
  })
  //console.log('otvorenie port: ', port)
  // pri prichodzich spravach nas zaujima len string ukonceny znakom '\n'
  const parser = port.pipe(new Readline({
    delimiter: '\n'
  }))
  // Open errors will be emitted as an error event
  port.on('error', err => {
    console.log('Error: ', err.message)
  })
  //funkcia vrati true ak je nastaveny bit v num podla masky, inak false
  function getBitFromByte(num, mask) {
    return Boolean(num & mask)
  }
  // spracovanie prichodzej spravy
  parser.on('data', data => {
    //    console.log(Telegram)
    let ar_rx_msg = new Telegram
    ar_rx_msg.setBuffer(data)
    ar_rx_msg.decodeTelegram()
    if (ar_rx_msg.isValidTelegram()) {
      //    let string = String.fromCharCode.apply(null, new Uint8Array(ar_rx_msg.getBuffer()))
      //    console.log('server rx is valid > ', string)

      //feedbacky z arduina
      let fdb_var = ar_rx_msg.getUint16(_FDB)
      //feedback koncak garaz otvorena
      rx_msg.gar_on = getBitFromByte(fdb_var, FBK.GAR_ON)
      //feedback koncak garaz zatvorena
      rx_msg.gar_off = getBitFromByte(fdb_var, FBK.GAR_OFF)
      //feedback koncak garaz zatvorena
      rx_msg.gar_stop = getBitFromByte(fdb_var, FBK.GAR_STOP)
      //feedback zapnute svetlo
      rx_msg.lit_on = getBitFromByte(fdb_var, FBK.LIT_ON)
      //feedback zapnute svetlo
      rx_msg.lit_off = getBitFromByte(fdb_var, FBK.LIT_OFF)
      //feedback zapnute svetlo
      rx_msg.lit_aut = getBitFromByte(fdb_var, FBK.LIT_AUT)
      //feedback nastavena teplota
      rx_msg.tem_spt = ar_rx_msg.getUint16(_STM)
      //feedback aktualna teplota
      rx_msg.tem_act = ar_rx_msg.getUint16(_ATM)
      //feedback aktualny osvit
      rx_msg.amb_lit = ar_rx_msg.getUint16(_ATB)
      //rele 0 aktualny stav
      rx_msg.rele_0 = getBitFromByte(fdb_var, FBK.RELE_0)
      //rele 1 aktualny stav
      rx_msg.rele_1 = getBitFromByte(fdb_var, FBK.RELE_1)
      //rele 2 aktualny stav
      rx_msg.rele_2 = getBitFromByte(fdb_var, FBK.RELE_2)
      //      console.log(rx_msg)
    }
  })
  //kazdu sekundu odosli telegram s prikazmi do arduina
  setInterval(() => {
    //ak chceme nieco v arduine zmenit
    if (cmd_set) {
      //vynuluj poziadavku na zmenu
      cmd_set = false
      //zakodovany povel pre arduino v 16bitovej premennej
      let cmd_var = 0
      //priprav telegram na odoslanie
      let ar_tx_msg = new Telegram
      //ak sa ma zmenit setpoint teploty
      if (tx_msg.tem_set) {
        //nastav prislusny bit v 16 bit commande
        cmd_var |= CMD.TEM_SET
        ar_tx_msg.setUint16(_STM, tx_msg.tem_spt)
        //vynuluj poziadavky
        tx_msg.tem_set = false
        tx_msg.tem_spt = 0
      }
      // povel otvorit garaz
      if (tx_msg.gar_on) {
        cmd_var |= CMD.GAR_ON
        tx_msg.gar_on = false
      }
      // povel zatvorit garaz
      if (tx_msg.gar_off) {
        cmd_var |= CMD.GAR_OFF
        tx_msg.gar_off = false
      }
      // povel zastavit garaz
      if (tx_msg.gar_stop) {
        cmd_var |= CMD.GAR_STOP
        tx_msg.gar_off = false
      }
      //ak sa ma zapnut svetlo
      if (tx_msg.lit_on) {
        cmd_var |= CMD.LIT_ON
        tx_msg.lit_on = false
      }
      //ak sa ma vypnut svetlo
      if (tx_msg.lit_off) {
        cmd_var |= CMD.LIT_OFF
        tx_msg.lit_off = false
      }
      //ak sa ma svetlo zapinat automaticky
      if (tx_msg.lit_aut) {
        cmd_var |= CMD.LIT_AUT
        tx_msg.lit_aut = false
      }
      //uloz zakodovany prikaz do telegramu a zakoduj telegram na odoslanie
      ar_tx_msg.setUint16(_CMD, cmd_var)
      ar_tx_msg.encodeTelegram()
      let string = String.fromCharCode.apply(null, new Uint8Array(ar_tx_msg.getBuffer()))
      //odosli telegram do arduina
      port.write(string)
      //  console.log('server tx is valid > ', string)
    }
    //toto opakuj kazdu sekundu ak mas co poslat
  }, AR_TX_TIMING)
}
//komunikacia s arduinom po seriovej linke spust
init_arduino_communication()
//------------------------------------------------------------------------------
// SERVER HTTP
//------------------------------------------------------------------------------
//udalosti spracovane od frontend zariadeni, HTTP server
const server = require('server')

const {
  error,
  get,
  post
} = server.router

const {
  status,
  file,
  render,
  json
} = server.reply

//spusti HTTP server
server({
  public: "../public",
  views:"../views",
  engine: 'hbs',
  port: 8080
}, [

  get('/js/:file', ctx => {
  // console.log("------------------------------------------");
  // console.log(ctx.params.file); 

    let filename = ctx.options.public + "/js/" + ctx.params.file;
    console.log(filename);
    return type('application/json').file(filename);
  }),

  get('/css/:file', ctx => {
  // console.log("------------------------------------------");
  // console.log(ctx.params.file);  

    let filename = ctx.options.public + "/css/" + ctx.params.file;
    console.log(filename);
    return type('text/html').file(filename);
  }),

  get('/', ctx => render('index.hbs')), // eslint-disable-line no-unused-vars
  get('/rx', ctx => json(rx_msg)), // eslint-disable-line no-unused-vars
  post('/tx', ctx => {
    //nastav prislusny bit v 16 bit commande
    Object.keys(ctx.data).forEach(key => {
      if (tx_msg.hasOwnProperty(key))
        tx_msg[key] = ctx.data[key]
    })
    //nastav priznak pre spacovanie poziadavky
    cmd_set = true
    // Show the submitted data on the console:
    //    console.log(ctx.data)
    return json({
      'ok': true
    })
  }),
  error(ctx => status(500).send(ctx.error.message)),
  get(ctx => status(404)) // eslint-disable-line no-unused-vars
])