//telegram.js
"use strict";

//const CONSTANTS = require('./variables.js');

//telegram prijaty z Arduina
var RX_Message = {
  //allways STX
  stx: 1, // 0
  len: 0, // 1
  //payload
  b_0: 0, // 2
  b_1: 0, // 4
  b_2: 0, // 6
  b_3: 0, // 8
  b_4: 0, //10
  b_5: 0, //12
  b_6: 0, //14
  b_7: 0, //16
  b_8: 0, //18
  b_9: 0, //20
  //allways ETX
  ctc: 0, //22
  etx: 1 //23
};

//telegram odosielany do Arduina
var TX_Message = {
  //allways STX
  stx: 2, // 0
  len: 0, // 1
  //payload
  b_0: 0, // 2
  b_1: 0, // 4
  b_2: 0, // 6
  b_3: 0, // 8
  b_4: 0, //10
  b_5: 0, //12
  b_6: 0, //14
  b_7: 0, //16
  b_8: 0, //18
  b_9: 0, //20
  //allways ETX
  ctc: 0, //22
  etx: 2 //23
};

let CONSTANTS = {
  MSG_LEN: 24,
  BUF_LEN: 49, //MSG_LEN * 2 + 1,
  ADD: 0x41, //temp char
  STX: 0x2, //start of telegram
  ETX: 0x3, //end of telegram
  START: 0,
  STOP: 23 //MSG_LEN - 1
};

class Telegram {

  constructor() {
    // create an ArrayBuffer with a size in bytes
    this.msg = new ArrayBuffer(CONSTANTS.MSG_LEN);
    //
    this.buf = new ArrayBuffer(CONSTANTS.BUF_LEN);
    //preset telegram header
    this.setByteInTelegram(CONSTANTS.START, CONSTANTS.STX);
    //preset telegram footer
    this.setByteInTelegram(CONSTANTS.STOP, CONSTANTS.ETX);
  }
  logTelegram() {
    var telegram = new Uint8Array(this.getBuffer(), 0, CONSTANTS.MSG_LEN);
    for (var i = 0; i < CONSTANTS.MSG_LEN; i++) {
      console.log("telegram>> ", telegram[i]);
    }
  }
  logBuffer() {
    var buffer = new Uint8Array(this.getBuffer(), 0, CONSTANTS.BUF_LEN);
    for (var i = 0; i < CONSTANTS.BUF_LEN; i++) {
      console.log("buffer>> ", buffer[i]);
    }
  }

  getTelegram() {
    return this.msg;
  }

  getBuffer() {
    return this.buf;
  }

  setBuffer(str) {
    var buffer = new DataView(this.getBuffer(), 0, CONSTANTS.BUF_LEN);

    const buf = Buffer.from(str, 'ascii');
    var i = 0;
    for (const b of buf) {
      if (i < CONSTANTS.BUF_LEN) {
        buffer.setUint8(i, b);
      }
      i++;
    }
  }

  setTelegram(str) {
    var telegram = new DataView(this.getTelegram(), 0, CONSTANTS.MSG_LEN);

    const buf = Buffer.from(str, 'ascii');
    var i = 0;
    for (const b of buf) {
      if (i < CONSTANTS.MSG_LEN) {
        telegram.setUint8(i, b);
      }
      i++;
    }
  }

  setByteInTelegram(num, val) {
    if (!isNaN(num) && (num >= 0) && (num < CONSTANTS.MSG_LEN)) {
      var uint8 = new Uint8Array(this.getTelegram(), 0, CONSTANTS.MSG_LEN);
      return uint8[num] = val & 0xFF;
    }
    return undefined;
  }

  getByteInTelegram(num) {
    if (!isNaN(num) && (num >= 0) && (num < CONSTANTS.MSG_LEN)) {
      var uint8 = new Uint8Array(this.getTelegram(), 0, CONSTANTS.MSG_LEN);
      return uint8[num];
    }
    return undefined;
  }

  setByteInBuffer(num, val) {
    if (!isNaN(num) && (num >= 0) && (num < CONSTANTS.BUF_LEN)) {
      var uint8 = new Uint8Array(this.getBuffer(), 0, CONSTANTS.BUF_LEN);
      return uint8[num] = val & 0xFF;
    }
    return undefined;
  }

  getByteInBuffer(num) {
    if (!isNaN(num) && (num >= 0) && (num < CONSTANTS.BUF_LEN)) {
      var uint8 = new Uint8Array(this.getBuffer(), 0, CONSTANTS.BUF_LEN);
      return uint8[num];
    }
    return undefined;
  }

  getUint16(num) {
    if (!isNaN(num) && (num < 10) && (num >= 0)) {
      var uint16 = new Uint16Array(this.getTelegram(), 2, 10);
      return uint16[num];
    } else {
      return undefined;
    }
  }

  setUint16(num, val) {
    if (!isNaN(num) && (num < 10) && (num >= 0)) {
      var uint16 = new Uint16Array(this.getTelegram(), 2, 10);
      return uint16[num] = val;
    } else {
      return undefined;
    }
  }

  isValidTelegram() {
    if (this.getByteInTelegram(CONSTANTS.START) !== CONSTANTS.STX) {
      return false;
    }
    if (this.getByteInTelegram(CONSTANTS.STOP) !== CONSTANTS.ETX) {
      return false;
    }
    return true;
  }

  encodeTelegram() {
    var a, b, c;
    var telegram = new Uint8Array(this.getTelegram(), 0, CONSTANTS.MSG_LEN);
    var buffer = new Uint8Array(this.getBuffer(), 0, CONSTANTS.BUF_LEN);

    for (var i = 0, j = 0; i < CONSTANTS.MSG_LEN; i++) {
      c = telegram[i];
      a = c & 0x0F;
      b = (c >> 4) & 0x0F;
      buffer[j] = (a + CONSTANTS.ADD) & 0xFF;
      j++;
      buffer[j] = (b + CONSTANTS.ADD) & 0xFF;
      j++;
    }
    return buffer;
  }

  decodeTelegram() {
    var a, b, c;
    var telegram = new Uint8Array(this.getTelegram(), 0, CONSTANTS.MSG_LEN);
    var buffer = new Uint8Array(this.getBuffer(), 0, CONSTANTS.BUF_LEN);

    for (var i = 0, j = 0; i < CONSTANTS.MSG_LEN; i++) {
      a = (buffer[j] - CONSTANTS.ADD) & 0x0F;
      j++;
      b = (buffer[j] - CONSTANTS.ADD) & 0x0F;
      j++;
      telegram[i] = a | (b << 4);
    }
    return telegram;
  }
};

module.exports={ CONSTANTS, RX_Message, TX_Message, Telegram }
//module.exports = Telegram;

/*
Telegram.MSG_LEN = 24;
Telegram.BUF_LEN = Telegram.MSG_LEN * 2 + 1;
Telegram.ADD = 0x41; //temp char
Telegram.STX = 0x2; //start of telegram
Telegram.ETX = 0x3; //end of telegram
Telegram.START = 0;
Telegram.STOP = Telegram.MSG_LEN - 1;
*/
