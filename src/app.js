//app.js
//const serialjs = require('serialport-js');
const server = require('server');

const {
  get,
  post,
  socket
} = require('server/router');

const {
  render,
  json
} = require('server/reply');

var {
  CONSTANTS,
  RX_Message,
  TX_Message,
  Telegram
} = require('src/telegram');

/*
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort(path, { baudRate: 115200 });

const parser = new Readline()
port.pipe(parser)

parser.on('data', line => console.log(`> ${line}`))
port.write('ROBOT POWER ON\n')
*/
//> ROBOT ONLINE
/*
//nastavenie prenosu po seriovej linke
const init = async () => {
  console.log('init  >>>>>>>>>>');
  const interval = 1000; //1 sekunda

  const delimiter = '\n';

  const ports = serialjs.find();
  console.log(ports);
  if (ports.length) {
    try {
      let port = await serialjs.open(ports[0].port, delimiter);
    } catch (e) {
      console.log(e);
    }
    port.on('data', (data) => {
      console.log(data);
      var msg = new Telegram;
      msg.setBuffer(data);
      msg.decodeTelegram();
      if (msg.isValidTelegram()) {
        console.log('is valid');
        RX_Message.stx = msg.getByteInTelegram(CONSTANTS.START);
        RX_Message.b_0 = msg.getUint16(0);
        RX_Message.b_1 = msg.getUint16(1);
        RX_Message.b_2 = msg.getUint16(2);
        RX_Message.b_3 = msg.getUint16(3);
        RX_Message.b_4 = msg.getUint16(4);
        RX_Message.b_5 = msg.getUint16(5);
        RX_Message.b_6 = msg.getUint16(6);
        RX_Message.b_7 = msg.getUint16(7);
        RX_Message.b_8 = msg.getUint16(8);
        RX_Message.b_9 = msg.getUint16(9);
        RX_Message.etx = msg.getByteInTelegram(CONSTANTS.STOP);
      }
    });

    port.on('error', (error) => {
      console.error(error);
    });

    setInterval(async () => {
      try {
        var msg = new Telegram;
        TX_Message.b_6++;

        console.log('TX_Message', TX_Message.b_6);
        msg.setByteInTelegram(CONSTANTS.START, CONSTANTS.STX);
        msg.setUint16(0, TX_Message.b_0);
        msg.setUint16(1, TX_Message.b_1);
        msg.setUint16(2, TX_Message.b_2);
        msg.setUint16(3, TX_Message.b_3);
        msg.setUint16(4, TX_Message.b_4);
        msg.setUint16(5, TX_Message.b_5);
        msg.setUint16(6, TX_Message.b_6);
        msg.setUint16(7, TX_Message.b_7);
        msg.setUint16(8, TX_Message.b_8);
        msg.setUint16(9, TX_Message.b_9);
        msg.setByteInTelegram(CONSTANTS.STOP, CONSTANTS.ETX);
        msg.encodeTelegram();
        console.log(msg.getBuffer().toString('ascii'));
        await port.send(msg.getBuffer().toString('ascii'));
      } catch (e) {
        console.log(e);
      }
    }, interval);
  }
};

init();
*/
//start server
server([
  get('/', async ctx => await render('./public/index.html')),
  post('/', async ctx => await json(ctx.data)),
  get('/tx', async ctx => await json(TX_Message)),
  get('/rx', async ctx => await json(RX_Message)),
  // Receive a message from a single socket
  socket('message', ctx => {

    // Send the message to every socket
    io.emit('message', ctx.data);
  }),
  get(async ctx => await status(404))
]);
