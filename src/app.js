//app.js
'use strict';

var {
  CONSTANTS,
  RX_Message,
  TX_Message,
  Telegram
} = require('./telegram.js');

// ak sa nieco zmenilo v poveloch pre arduino
var cmd_set = false;
//konstanty pre kodovanie povelu pre Arduino
const CMD = {
  GAR_ON: 0x0001,
  GAR_OFF: 0x0002,
  LIT_ON: 0x0004,
  LIT_OFF: 0x0008,
  TEM_SET: 0x000A
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
//konstanty pre kodovanie feedbacku od arduina
const FBK = {
  // zapnutie svetla
  LIT_ON: 0b0000000000000001,
  //garaz otvorena
  GAR_ON: 0b0000000000001000,
  //GAR_ON: 0b0000100000000000,
  //GAR_ON: 0b1111111111111111,
  //garaz zatvorena
  GAR_OFF: 0b000000000010000,
  //GAR_OFF: 0b0001000000000000,
  //  zaluzie otvorena
  SUN_ON: 0b0000000000100000,
  //  zaluzie zatvorena
  SUN_OFF: 0b0000000001000000,
  // kurenie zapnute
  HEAT_ON: 0b0000000010000000,
  // chladenie zapnute
  COOL_ON: 0b0000000100000000,
  // ochrana zapnuta
  SAFE_ON: 0b0000001000000000,
  // rele_0
  RELE_0: 0b0000010000000000,
  // rele_1
  RELE_1: 0b0000100000000000,
  // rele_2
  RELE_2: 0b0001000000000000,
  // rele_3
  RELE_3: 0b0010000000000000,
  // rele_4
  RELE_4: 0b0100000000000000,
  // rele_5
  RELE_5: 0b1000000000000000
}
//telegram prijimany do Arduina
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
};
//nastavenie prenosu po seriovej linke pre komunikovanie s arduinom
const init_arduino_communication = () => {
  //zavolanie komunikacnych kniznic
  const SerialPort = require('serialport');
  const Readline = require('@serialport/parser-readline');
  //cesta ku seriovemu portu
  var comport;
  //priprav seriovu komunikaciu nezavisle na platforme a os
  //console.log(process.platform);
  if (process.platform === "win32") {
    comport = 'COM7';
  } else {
    comport = '/dev/ttyACM0';
  }
  //console.log('comport ', comport);
  // otvor a nastav seriovy port
  SerialPort.list().then(
    ports => ports.forEach(console.log),
    err => console.error(err)
  );

  const port = new SerialPort(comport, {
    baudRate: 115200
  }, (err) => {
    if (err) {
      return console.log('Error: ', err.message);
    }
  });
  // pri prichodzich spravach nas zaujima len string ukonceny znakom '\n'
  const parser = port.pipe(new Readline({
    delimiter: '\n'
  }));
  // Open errors will be emitted as an error event
  port.on('error', (err) => {
    console.log('Error: ', err.message);
  });

  function getBitFromByte(num, mask){
    return Boolean(num & mask) ;
  }

  // spracovanie prichodzej spravy
  parser.on('data', (data) => {
    var msg = new Telegram;
    msg.setBuffer(data);
    msg.decodeTelegram();
    if (msg.isValidTelegram()) {
      var string = String.fromCharCode.apply(null, new Uint8Array(msg.getBuffer()));
      //    console.log('server rx is valid > ', string);
      RX_Message.stx = msg.getByteInTelegram(CONSTANTS.START);
      RX_Message.b_0 = msg.getUint16(0);//feedback nastavena teplota
      RX_Message.b_1 = msg.getUint16(1);//feedback aktualna teplota
      RX_Message.b_2 = msg.getUint16(2);//feedback aktualny osvit
      RX_Message.b_3 = msg.getUint16(3);
      RX_Message.b_4 = msg.getUint16(4);
      RX_Message.b_5 = msg.getUint16(5);
      RX_Message.b_6 = msg.getUint16(6);
      RX_Message.b_7 = msg.getUint16(7);
      RX_Message.b_8 = msg.getUint16(8);//feedbacky z arduina
      RX_Message.b_9 = msg.getUint16(9);//commandy do arduina
      RX_Message.etx = msg.getByteInTelegram(CONSTANTS.STOP);
      //feedback zapnute svetlo
      rx_msg.lit_on = getBitFromByte(RX_Message.b_8, FBK.LIT_ON);
      //feedback koncak garaz otvorena
      rx_msg.gar_on = getBitFromByte(RX_Message.b_8, FBK.GAR_ON)
      //feedback koncak garaz zatvorena
      rx_msg.gar_off = getBitFromByte(RX_Message.b_8, FBK.GAR_OFF)

      //feedback nastavena teplota
      rx_msg.tem_spt = RX_Message.b_0;
      //feedback aktualna teplota
      rx_msg.tem_act = RX_Message.b_1;
      //feedback aktualny osvit
      rx_msg.amb_lit = RX_Message.b_2;
//console.log(rx_msg);
    }
  });
  //kazdu sekundu odosli telegram s prikazmi do arduina
  const interval = 1000; //1 sekunda = 1000ms
  setInterval(() => {
    //ak chceme nieco v arduine zmenit
    if (cmd_set) {
      //vynuluj poziadavku na zmenu
      cmd_set = false;
      //zakodovany povel pre arduino v 16bitovej premennej
      var cmd_var = 0;
      //priprav telegram na odoslanie
      var msg = new Telegram;
      msg.setByteInTelegram(CONSTANTS.START, CONSTANTS.STX);
      msg.setByteInTelegram(CONSTANTS.STOP, CONSTANTS.ETX);
      //ak sa ma zmenit setpoint teploty
      if (tx_msg.tem_set) {
        //nastav prislosny bit v 16 bit commande
        cmd_var |= CMD.TEM_SET;
        msg.setUint16(6, tx_msg.tem_spt);
        //vynuluj poziadavky
        tx_msg.tem_set = false;
        tx_msg.tem_spt = 0;
      }
      //ak sa ma zapnut svetlo
      if (tx_msg.lit_on) {
        cmd_var |= CMD.LIT_ON;
        tx_msg.lit_on = false;
      }
      //ak sa ma vypnut svetlo
      if (tx_msg.lit_off) {
        cmd_var |= CMD.LIT_OFF;
        tx_msg.lit_off = false;
      }
      //uloz zakodovany prikaz do telegramu a zakoduj telegram na odoslanie
      msg.setUint16(9, cmd_var);
      msg.encodeTelegram();
      var string = String.fromCharCode.apply(null, new Uint8Array(msg.getBuffer()));
      //odosli telegram do arduina
      port.write(string);
      //  console.log('server tx is valid > ', string);
    }
    //toto opakuj kazdu sekundu ak mas co poslat
  }, interval);
}
//komunikacia s arduinom po seriovej linke spust
init_arduino_communication();

//udalosti spracovane od frontend zariadeni, HTTP server
const server = require('server');
const {
  error,
  get,
  post,
  socket
} = require('server/router');

const {
  render,
  status,
  json
} = require('server/reply');
//funkcia, ktora spracuje POST /tx
function processRequest(msg) {
  //console.log('processRequest', msg.data);
  //nastav prislosny bit v 16 bit commande
  //if (textStatus === 'success') {
    Object.keys(msg.data).forEach(key => {
      if (tx_msg.hasOwnProperty(key))
        tx_msg[key] = msg.data[key];
    });
    console.log('tx_msg >> changed ', tx_msg);
  //}
  // ano posli povel pre arduino
    cmd_set = true;
}
//spusti HTTP server
server([
  error(ctx => status(500).send(ctx.error.message)),
  get('/', async ctx => await render('./public/index.html')),
  get('/rx', async ctx => json(rx_msg)),
  post('/tx', processRequest, ctx => status(200)),

  socket('message', ctx => {

    // Send the message to every socket
    io.emit('message', ctx.data);
  }),
  get(async ctx => status(404))
]);
