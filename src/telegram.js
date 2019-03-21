//telegram.js
// ecmascript 2016
// "strict": "error"
"strict mode"
//definicia konstant
//dlzka bufferu telegramu v bajtoch
const MSG_LEN = 24;
//MSG_LEN * 2 + 1
const BUF_LEN = MSG_LEN * 2 + 1;
//temp char
const ADD = 0x41;
//MAGIC CHAR start of telegram
const STX = 0x02;
//MAGIC CHAR end of telegram
const ETX = 0x03;
//index prveho bajtu v buffere
const START = 0;
//index posledneho bajtu v buffere
const STOP = MSG_LEN - 1;
//telegram prijaty z Arduina
var RX_Message = {
  //allways STX
  stx: STX, // 0
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
  etx: ETX //23
}

//telegram odosielany do Arduina
var TX_Message = {
  //allways STX
  stx: STX, // 0
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
  etx: ETX //23
}

class Telegram {
  constructor() {
    // create an ArrayBuffer with a size in bytes
    this.msg = new ArrayBuffer(MSG_LEN)
    //
    this.buf = new ArrayBuffer(BUF_LEN)
    //preset telegram header
    this.setByteInTelegram(START, STX)
    //preset telegram footer
    this.setByteInTelegram(STOP, ETX)
  }

  logTelegram() {
    let telegram = new Uint8Array(this.getBuffer(), 0, MSG_LEN)
    for (let i = 0; i < MSG_LEN; i++) {
      console.log("telegram>> ", telegram[i])
    }
  }

  logBuffer() {
    let buffer = new Uint8Array(this.getBuffer(), 0, BUF_LEN)
    for (let i = 0; i < BUF_LEN; i++) {
      console.log("buffer>> ", buffer[i])
    }
  }

  getTelegram() {
    return this.msg
  }

  getBuffer() {
    return this.buf
  }

  setBuffer(str) {
    let buffer = new DataView(this.getBuffer(), 0, BUF_LEN)

    const buf = Buffer.from(str, 'ascii')
    let i = 0
    for (const b of buf) {
      if (i < BUF_LEN) {
        buffer.setUint8(i, b)
      }
      i++
    }
  }

  setTelegram(str) {
    let telegram = new DataView(this.getTelegram(), 0, MSG_LEN)

    const buf = Buffer.from(str, 'ascii')
    let i = 0
    for (const b of buf) {
      if (i < MSG_LEN) {
        telegram.setUint8(i, b)
      }
      i++
    }
  }

  setByteInTelegram(num, val) {
    if (!isNaN(num) && (num >= 0) && (num < MSG_LEN)) {
      let uint8 = new Uint8Array(this.getTelegram(), 0, MSG_LEN)
      return uint8[num] = val & 0xFF
    }
    return undefined
  }

  getByteInTelegram(num) {
    if (!isNaN(num) && (num >= 0) && (num < MSG_LEN)) {
      let uint8 = new Uint8Array(this.getTelegram(), 0, MSG_LEN)
      return uint8[num]
    }
    return undefined
  }

  setByteInBuffer(num, val) {
    if (!isNaN(num) && (num >= 0) && (num < BUF_LEN)) {
      let uint8 = new Uint8Array(this.getBuffer(), 0, BUF_LEN)
      return uint8[num] = val & 0xFF
    }
    return undefined
  }

  getByteInBuffer(num) {
    if (!isNaN(num) && (num >= 0) && (num < BUF_LEN)) {
      let uint8 = new Uint8Array(this.getBuffer(), 0, BUF_LEN)
      return uint8[num]
    }
    return undefined
  }

  getUint16(num) {
    if (!isNaN(num) && (num < 10) && (num >= 0)) {
      let uint16 = new Uint16Array(this.getTelegram(), 2, 10)
      return uint16[num]
    } else {
      return undefined
    }
  }

  setUint16(num, val) {
    if (!isNaN(num) && (num < 10) && (num >= 0)) {
      let uint16 = new Uint16Array(this.getTelegram(), 2, 10)
      return uint16[num] = val
    } else {
      return undefined
    }
  }

  isValidTelegram() {
    if (this.getByteInTelegram(START) !== STX) {
      return false
    }
    if (this.getByteInTelegram(STOP) !== ETX) {
      return false
    }
    return true
  }

  encodeTelegram() {
    let a, b, c
    let telegram = new Uint8Array(this.getTelegram(), 0, MSG_LEN)
    let buffer = new Uint8Array(this.getBuffer(), 0, BUF_LEN)

    for (let i = 0, j = 0; i < MSG_LEN; i++) {
      c = telegram[i]
      a = c & 0x0F
      b = (c >> 4) & 0x0F
      buffer[j] = (a + ADD) & 0xFF
      j++
      buffer[j] = (b + ADD) & 0xFF
      j++
    }
    return buffer
  }

  decodeTelegram() {
    let a, b
    let telegram = new Uint8Array(this.getTelegram(), 0, MSG_LEN)
    let buffer = new Uint8Array(this.getBuffer(), 0, BUF_LEN)

    for (let i = 0, j = 0; i < MSG_LEN; i++) {
      a = (buffer[j] - ADD) & 0x0F
      j++
      b = (buffer[j] - ADD) & 0x0F
      j++
      telegram[i] = a | (b << 4)
    }
    return telegram
  }
}

module.exports = {
  RX_Message,
  TX_Message,
  Telegram
}