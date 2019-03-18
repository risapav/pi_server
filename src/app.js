//app.js
// ecmascript 2016
// "strict": "error"
"strict mode"
//konstanty pre komunikovanie s ARDUINOM
//kazdych 1000ms odosle telegram do Arduina
const AR_TX_TIMING = 1000
//konstanty pre kodovanie povelu pre Arduino
const CMD = {
  GAR_ON: 0x0001,
  GAR_OFF: 0x0002,
  LIT_ON: 0x0004,
  LIT_OFF: 0x0008,
  TEM_SET: 0x0010
}
//konstanty pre kodovanie feedbacku od arduina
const FBK = {
  // zapnutie svetla
  LIT_ON: 0x0001,
  // garaz otvorena
  GAR_ON: 0x0008,
  // garaz zatvorena
  GAR_OFF: 0x0010,
  // zaluzie otvorena
  SUN_ON: 0x0020,
  // zaluzie zatvorena
  SUN_OFF: 0x0040,
  // kurenie zapnute
  HEAT_ON: 0x0080,
  // chladenie zapnute
  COOL_ON: 0x0100,
  // ochrana zapnuta
  SAFE_ON: 0x0200,
  // rele_0
  RELE_0: 0x0400,
  // rele_1
  RELE_1: 0x0800,
  // rele_2
  RELE_2: 0x1000,
  // rele_3
  RELE_3: 0x2000,
  // rele_4
  RELE_4: 0x4000,
  // rele_5
  RELE_5: 0x8000
}
// ak sa nieco zmenilo v poveloch pre arduino, true pre odoslanie do arduina
var cmd_set = false
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
}
//telegram prijimany z Arduina, vsetky feedbacky z arduina
var rx_msg = {
  //feedback garaz otvorena
  gar_on: false,
  //feedback garaz zatvorena
  gar_off: false,
  //feedback svetla zapnute alebo vypnute
  lit_on: false,
  //feedback nastavena teplota
  tem_spt: 0,
  //feedback aktualna teplota
  tem_act: 0,
  //feedback aktualny osvit
  amb_lit: 0
}
//------------------------------------------------------------------------------
// KOMUNIKACIA S ARDUINOM
//------------------------------------------------------------------------------
//zavolanie komunikacnych kniznic
//import SerialPort from 'serialport'
const SerialPort = require('serialport')
//import * as SerialPort from 'serialport.js';
const Readline = require('@serialport/parser-readline')
const Telegram = require('./telegram.js')
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
  const port = new SerialPort(comport, {
    baudRate: 115200
  }, err => {
    if (err) {
      return console.log('Error: ', err.message)
    }
  })
  // pri prichodzich spravach nas zaujima len string ukonceny znakom '\n'
  const parser = port.pipe(new Readline({
    delimiter: '\n'
  }))
  // Open errors will be emitted as an error event
  port.on('error', err => {
    console.log('Error: ', err.message)
  })
  //funkcia vrati bool ak je nastaveny bit v num podla masky
  function getBitFromByte(num, mask) {
    return Boolean(num & mask)
  }
  // spracovanie prichodzej spravy
  parser.on('data', data => {
    let ar_rx_msg = new Telegram
    ar_rx_msg.setBuffer(data)
    ar_rx_msg.decodeTelegram()
    if (ar_rx_msg.isValidTelegram()) {
      // let string = String.fromCharCode.apply(null, new Uint8Array(ar_rx_msg.getBuffer()))
      // console.log('server rx is valid > ', string)

      //feedbacky z arduina
      let fdb_var = ar_rx_msg.getUint16(8)
      //feedback zapnute svetlo
      rx_msg.lit_on = getBitFromByte(fdb_var, FBK.LIT_ON)
      //feedback koncak garaz otvorena
      rx_msg.gar_on = getBitFromByte(fdb_var, FBK.GAR_ON)
      //feedback koncak garaz zatvorena
      rx_msg.gar_off = getBitFromByte(fdb_var, FBK.GAR_OFF)
      //feedback nastavena teplota
      rx_msg.tem_spt = ar_rx_msg.getUint16(0)
      //feedback aktualna teplota
      rx_msg.tem_act = ar_rx_msg.getUint16(1)
      //feedback aktualny osvit
      rx_msg.amb_lit = ar_rx_msg.getUint16(2)
      // console.log(rx_msg)
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
        //nastav prislosny bit v 16 bit commande
        cmd_var |= CMD.TEM_SET
        ar_tx_msg.setUint16(6, tx_msg.tem_spt)
        //vynuluj poziadavky
        tx_msg.tem_set = false
        tx_msg.tem_spt = 0
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
      //uloz zakodovany prikaz do telegramu a zakoduj telegram na odoslanie
      ar_tx_msg.setUint16(9, cmd_var)
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
} = require('server/router')

const {
  status,
  render,
  json
} = require('server/reply')

//spusti HTTP server
server({
  port: 8080,
  engine: 'hbs'
}, [
  error(ctx => status(500).send(ctx.error.message)),
  get('/', ctx => render('index.hbs')), // eslint-disable-line no-unused-vars
  get('/rx', ctx => json(rx_msg)), // eslint-disable-line no-unused-vars
  post('/tx', ctx => {
    //nastav prislusny bit v 16 bit commande
    Object.keys(ctx.data).forEach(key => {
      if (tx_msg.hasOwnProperty(key))
        tx_msg[key] = ctx.data[key]
    })
    // Show the submitted data on the console:
    console.log(ctx.data)
    return json({
      'ok': true
    })
  }),
  get(ctx => status(404)) // eslint-disable-line no-unused-vars
])