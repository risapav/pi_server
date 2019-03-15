//app.js
const server = require('server');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

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

var comport;

//nastavenie prenosu po seriovej linke
const init = () => {
  console.log(process.platform);
  if (process.platform === "win32") {
    comport = 'COM7';
  } else {
    comport = '/dev/ttyACM0';
  }
  console.log('comport ', comport);

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

  const parser = port.pipe(new Readline({
    delimiter: '\n'
  }));

  // Open errors will be emitted as an error event
  port.on('error', function(err) {
    console.log('Error: ', err.message);
  });

  console.log('init  >>>>>>>>>>');
  const interval = 1000; //1 sekunda

  parser.on('data', (data) => {
    var msg = new Telegram;
    msg.setBuffer(data);
    msg.decodeTelegram();
    if (msg.isValidTelegram()) {
      var string = String.fromCharCode.apply(null, new Uint8Array(msg.getBuffer()));
      console.log('server rx is valid > ', string);
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

  setInterval(() => {
    var msg = new Telegram;
    TX_Message.b_6++;

    //    console.log('TX_Message', TX_Message.b_6);
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

    var string = String.fromCharCode.apply(null, new Uint8Array(msg.getBuffer()));
    port.write(string);
    console.log('server rx is valid > ', string);

  }, interval);
}

init();

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
