//main.js
'use strict';
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
//kazdu sekundu odosli telegram s prikazmi do servera
const interval = 1000; //1 sekunda = 1000ms
setInterval(() => {
  //ak chceme nieco v arduine zmenit
  if (cmd_set) {
    //vynuluj poziadavku na zmenu
    cmd_set = false;
    //odosli dotaz na server so zakodovanim JSON tx_msg
    $.ajax({
      url: '/tx',
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify(tx_msg),
      processData: false,
      success: (data, textStatus, jQxhr) => {
        console.log('success /tx post request >', data, textStatus, jQxhr);
        //        $('#response pre').html( JSON.stringify( data ) );
      },
      error: (jqXhr, textStatus, errorThrown) => {
        console.log('error /tx post request >', errorThrown);
      }
    });
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
}, interval);
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
  tem_spt: false,
  //feedback aktualna teplota
  tem_act: 0,
  //feedback aktualny osvit
  amb_lit: 0
};
//kazdu sekundu nacitaj stav z arduina
setInterval(() => {
  //odosli dotaz na server so aby poslal JSON rx_msg
  $.ajax({
    dataType: "json",
    url: '/rx',
    data: (data) => {
      console.log('data /rx get request >', JSON.parse(data));
    },
    success: (data, textStatus, jQxhr) => {
      if(textStatus==='success'){
        Object.keys(data).forEach(key => {
          if(rx_msg.hasOwnProperty(key))
          rx_msg[key] = data[key];
        });
        console.log('rx_msg >> changed ', rx_msg);
      }
    },
    error: (jqXhr, textStatus, errorThrown) => {
      console.log('error /rx get request >', errorThrown);
    }
  });
  //toto opakuj kazdu sekundu ak mas co poslat
}, interval);
