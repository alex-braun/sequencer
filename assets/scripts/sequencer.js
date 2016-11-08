'use strict';


//CREATE THE AUDIO BUFFER
let context = new window.AudioContext() || new window.webkitAudioContext();

// let NUM_INSTRUMENTS = 2;
//
// function Kit(name) {
//   this.AUDIO_PATH = "assets/audio/";
//   this.name = name;
//
//   this.kickBuffer = null;
//   this.snareBuffer = null;
//   this.hihatCloseBuffer = null;
//   this.hihatOpenBuffer = null;
//   this.clapBuffer = null;
//
//   this.startedLoading = false;
//   this.isLoaded = false;
//   this.instrumentLoadCount = 0;
// }
//
// Kit.prototype.pathName = function() {
//   return this.AUDIO_PATH + this.name + "/";
// };
//
// Kit.prototype.load = function() {
//   if (this.startedLoading) {
//     return;
//   }
//
//   this.startedLoading = true;
//
//   let pathName = this.pathName();
//
//   //don't want to have set number of instruments, or whatever
//   let kickPath = pathName + "kick.wav";
//   let snarePath = pathName + "snare.wav";
//   let hihatClosePath = pathName + "hihatClose.wav";
//   let hihatOpenPath = pathName + "hihatOpen.wav";
//   let clapPath = pathName + "clap.wav";
//
//   this.loadSample(kickPath, "kick");
//   this.loadSample(snarePath, "snare");
//   this.loadSample(hihatClosePath, "hihatClose");
//   this.loadSample(hihatOpenPath, "hihatOpen");
//   this.loadSample(clapPath, "clap");
// };
//
//
// //this should definitely be part of a sample class, pass in kit or st
// //if we have the name of a sample type, then we can do metaprogramming awesomeness.
// Kit.prototype.loadSample = function(url, instrumentName) {
//   //need 2 load asynchronously
//   let request = new XMLHttpRequest();
//   request.open("GET", url, true);
//   request.responseType = "arraybuffer";
//
//   let kit = this;
//
//   request.onload = function() {
//     context.decodeAudioData(
//       request.response,
//       function(buffer) {
//         switch (instrumentName) {
//           case "kick":
//             kit.kickBuffer = buffer;
//             break;
//           case "snare":
//             kit.snareBuffer = buffer;
//             break;
//           case "hihatClose":
//             kit.hihatCloseBuffer = buffer;
//             break;
//           case "hihatOpen":
//             kit.hihatOpenBuffer = buffer;
//             break;
//           case "clap":
//             kit.clapBuffer = buffer;
//             break;
//         }
//         kit.instrumentLoadCount++;
//         if (kit.instrumentLoadCount === NUM_INSTRUMENTS) {
//           kit.isLoaded = true;
//         }
//       },
//       // function(buffer) {
//       //   console.log("Error decoding drum samples!");
//       // }
//     );
//   };
//   request.send();
//   console.log(request);
// };
//
// // //create a new instance of WAAPI
// // let context = new AudioContext();
//
// //
// console.log(context.sampleRate);
// // → 44100
// console.log(context.destination.channelCount);
// // → 2




//bass drum
function Kick(context) {
	this.context = context;
}

Kick.prototype.setup = function() {
  this.osc = this.context.createOscillator();
  this.gain = this.context.createGain();
  this.osc.connect(this.gain);
  this.gain.connect(this.context.destination);
};
Kick.prototype.trigger = function(time) {
  this.setup();
//jQuery here for frequency level!
  this.osc.frequency.setValueAtTime(150, time);
  this.osc.type = 'sine';
//jQuery here for volume level!
  this.gain.gain.setValueAtTime(1, time);
  this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  this.osc.start(time);
  this.osc.stop(time + 0.5);
};

const kick = new Kick(context);


// //snare
function Snare(context) {
	this.context = context;
}

Snare.prototype.noiseBuffer = function() {
	let bufferSize = this.context.sampleRate;
	let buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
	let output = buffer.getChannelData(0);

	for (let i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}
	return buffer;
};

Snare.prototype.setup = function() {
	this.noise = this.context.createBufferSource();
	this.noise.buffer = this.noiseBuffer();
	let noiseFilter = this.context.createBiquadFilter();
	noiseFilter.type = 'highpass';
	noiseFilter.frequency.value = 1000;
	this.noise.connect(noiseFilter);

  this.noiseEnvelope = this.context.createGain();
  noiseFilter.connect(this.noiseEnvelope);

  this.noiseEnvelope.connect(this.context.destination);
  this.osc = this.context.createOscillator();
  this.osc.type = 'triangle';

  this.oscEnvelope = this.context.createGain();
  this.osc.connect(this.oscEnvelope);
  this.oscEnvelope.connect(this.context.destination);
};

Snare.prototype.trigger = function(time) {
	this.setup();
//jQuery snare white noise volume
	this.noiseEnvelope.gain.setValueAtTime(1, time);
	this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
	this.noise.start(time);

//jQuery snare drum pitch
	this.osc.frequency.setValueAtTime(100, time);
//jQuery snare drum volume
	this.oscEnvelope.gain.setValueAtTime(0.7, time);
	this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  this.osc.start(time);
	this.osc.stop(time + 0.2);
	this.noise.stop(time + 0.2);
};

const snare = new Snare(context);



//hihat synthesis
function HiHatClose(context) {
  this.context = context;
}

HiHatClose.prototype.setup = function() {
  this.osc = context.createOscillator();

  let bandpass = this.context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 10000;
  this.osc.connect(bandpass);

  let highpass = this.context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 7000;
  bandpass.connect(highpass);

  this.gain = this.context.createGain();
  highpass.connect(this.gain);
  this.gain.connect(this.context.destination);
};

HiHatClose.prototype.trigger = function(time) {
  let fundamental = 39.5;
  let ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
  for (let i = 0; i < ratios.length; i++) {

    this.setup();
    this.osc.type = 'square';
//jQuery here for volume
    this.gain.gain.setValueAtTime(1, time);
//jQuery fundamental is the frequency fundamental of the hihat
    this.osc.frequency.value = fundamental * ratios[i];
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    this.osc.start(time);
    this.osc.stop(time + 0.05);
  }
};

const hihatClose = new HiHatClose(context);


//hihat synthesis
function HiHatOpen(context) {
  this.context = context;
}

HiHatOpen.prototype.setup = function() {
  this.osc = context.createOscillator();

  let bandpass = this.context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 10000;
  this.osc.connect(bandpass);

  let highpass = this.context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 9000;
  bandpass.connect(highpass);

  this.gain = this.context.createGain();
  highpass.connect(this.gain);
  this.gain.connect(this.context.destination);
};

HiHatOpen.prototype.trigger = function(time) {
  let fundamental = 39.5;
  let ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
  for (let i = 0; i < ratios.length; i++) {

    this.setup();
    this.osc.type = 'square';
//jQuery here for volume
    this.gain.gain.setValueAtTime(1, time);
//jQuery fundamental is the frequency fundamental of the hihat
    this.osc.frequency.value = fundamental * ratios[i];
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
    this.osc.start(time);
    this.osc.stop(time + 0.6);
  }
};

const hihatOpen = new HiHatOpen(context);

let compressor;

let noteTime;
let startTime;
let lastDrawTime = -1;
let LOOP_LENGTH = 16;
let rhythmIndex = 0;
let timeoutId;
// let testBuffer = null;
let currentKit = null;
let masterGainNode;
// let effectLevelNode;
let tempo = 120;
let TEMPO_MAX = 200;
let TEMPO_MIN = 40;
let TEMPO_STEP = 4;




// function createLowPassFilterSliders() {
//   $("#freq-slider").slider({
//     value: 1,
//     min: 0,
//     max: 1,
//     step: 0.01,
//     disabled: true,
//     slide: changeFrequency
//   });
//   $("#quality-slider").slider({
//     value: 0,
//     min: 0,
//     max: 1,
//     step: 0.01,
//     disabled: true,
//     slide: changeQuality
//   });
// }

// function lowPassFilterListener() {
//   $('#lpf').click(function() {
//     $(this).toggleClass("active");
//     $(this).blur();
//     if ($(this).hasClass("btn-default")) {
//       $(this).removeClass("btn-default");
//       $(this).addClass("btn-warning");
//       lowPassFilterNode.active = true;
//       $("#freq-slider,#quality-slider").slider( "option", "disabled", false );
//     }
//     else {
//       $(this).addClass("btn-default");
//       $(this).removeClass("btn-warning");
//       lowPassFilterNode.active = false;
//       $("#freq-slider,#quality-slider").slider( "option", "disabled", true );
//     }
//   })
// }

// function reverbListener() {
//   $("#reverb").click(function() {
//     $(this).toggleClass("active");
//     $(this).blur();
//     if ($(this).hasClass("btn-default")) {
//       $(this).removeClass("btn-default");
//       $(this).addClass("btn-warning");
//       convolver.active = true;
//     }
//     else {
//       $(this).addClass("btn-default");
//       $(this).removeClass("btn-warning");
//       convolver.active = false;
//     }
//   })
// }

// function changeFrequency(event, ui) {
//   let minValue = 40;
//   let maxValue = context.sampleRate / 2;
//   let numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
//   let multiplier = Math.pow(2, numberOfOctaves * (ui.value - 1.0));
//   lowPassFilterNode.frequency.value = maxValue * multiplier;
// }

// function changeQuality(event, ui) {
//   //30 is the quality multiplier, for now.
//   lowPassFilterNode.Q.value = ui.value * 30;
// }






function initializeAudioNodes() {
  let finalMixNode;
  if (context.createDynamicsCompressor) {
      // Create a dynamics compressor to sweeten the overall mix.
      compressor = context.createDynamicsCompressor();
      compressor.connect(context.destination);
      finalMixNode = compressor;
  } else {
      // No compressor available in this implementation.
      finalMixNode = context.destination;
  }


  // Create master volume.
  // for now, the master volume is static, but in the future there will be a slider
  masterGainNode = context.createGain();
  masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
  masterGainNode.connect(finalMixNode);
}
  //connect all sounds to masterGainNode to play them

  //don't need this for now, no wet dry mix for effects
  // // Create effect volume.
  // effectLevelNode = context.createGain();
  // effectLevelNode.gain.value = 1.0; // effect level slider controls this
  // effectLevelNode.connect(masterGainNode);

  // Create convolver for effect
  // convolver = context.createConvolver();
  // convolver.active = false;
  // convolver.connect(effectLevelNode);

  //Create Low Pass Filter
//   lowPassFilterNode = context.createBiquadFilter();
//   //this is for backwards compatibility, the type used to be an integer
//   lowPassFilterNode.type = (typeof lowPassFilterNode.type === 'string') ? 'lowpass' : 0; // LOWPASS
//   //default value is max cutoff, or passing all frequencies
//   lowPassFilterNode.frequency.value = context.sampleRate / 2;
//   lowPassFilterNode.connect(masterGainNode);
//   lowPassFilterNode.active = false;


// function loadKits() {
//   let kit = new Kit('kit');
//   kit.load();
//   currentKit = kit;
// }

function playNote(instrument, noteTime) {
  // let voice = context.createBufferSource();
  // let voice = context.createBufferSource();
  // voice.buffer = instrument;

  let currentLastNode = masterGainNode;
  // if (lowPassFilterNode.active) {
  //   lowPassFilterNode.connect(currentLastNode);
  //   currentLastNode = lowPassFilterNode;
  // }
  // if (convolver.active) {
  //   convolver.buffer = reverbImpulseResponse.buffer;
  //   convolver.connect(currentLastNode);
  //   currentLastNode = convolver;
  // }
  // instrument.connect(currentLastNode);
  instrument.trigger(noteTime);
  // voice.connect(currentLastNode);
  // voice.start(noteTime);
}

function advanceNote() {
    // Advance time by a 16th note
    tempo = Number($("#tempo-input").val());

    let secondsPerBlock = 60.0 / tempo;
    rhythmIndex++;
    if (rhythmIndex === LOOP_LENGTH) {
        rhythmIndex = 0;
    }

    //0.25 because each square is a 16th note
    noteTime += 0.25 * secondsPerBlock;
}

function drawPlayhead(xindex) {
    let lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;

    //can change this to class selector to select a column
    let newRows = $('.column_' + xindex);
    let oldRows = $('.column_' + lastIndex);

    newRows.addClass("playing");
    oldRows.removeClass("playing");
}

function schedule() {
  let currentTime = context.currentTime;
  // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
  currentTime -= startTime;

  while (noteTime < currentTime + 0.200) {
      let contextPlayTime = noteTime + startTime;
      let currentPads = $(".column_" + rhythmIndex);
      currentPads.each(function() {
        if ($(this).hasClass("selected")) {
          let instrumentName = $(this).parents().data("instrument");
          switch (instrumentName) {
          case "kick":
            playNote(kick, contextPlayTime);
            break;
          case "snare":
            playNote(snare, contextPlayTime);
            break;
          case "hihatClose":
            playNote(hihatClose, contextPlayTime);
            break;
          case "hihatOpen":
            playNote(hihatOpen, contextPlayTime);
            break;
          case "clap":
            playNote(currentKit.clapBuffer, contextPlayTime);
            break;
        }
          //play the buffer
          //store a data element in the row that tells you what instrument
        }
      });
      if (noteTime !== lastDrawTime) {
          lastDrawTime = noteTime;
          drawPlayhead(rhythmIndex);
      }
      advanceNote();
  }

  timeoutId = requestAnimationFrame(schedule);
}





function handlePlay() {
    rhythmIndex = 0;
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();
}

function handleStop() {
  cancelAnimationFrame(timeoutId);
  $(".pad").removeClass("playing");
}

function initializeTempo() {
  $("#tempo-input").val(tempo);
}

function changeTempoListener() {
  $("#increase-tempo").click(function() {
    if (tempo < TEMPO_MAX) {
      tempo += TEMPO_STEP;
      $("#tempo-input").val(tempo);
    }
  });

  $("#decrease-tempo").click(function() {
    if (tempo > TEMPO_MIN) {
      tempo -= TEMPO_STEP;
      $("#tempo-input").val(tempo);
    }
  });
}

$(document).ready(function() {
  // loadKits();
  initializeAudioNodes();
  initializeTempo();
  changeTempoListener();
});
const addDrumHandlers = () => {
//toggle play button
  $('#play-pause').click(function() {
    let span = $(this).children('span');
    if (span.hasClass('glyphicon-play')) {
      span.removeClass('glyphicon-play');
      span.addClass('glyphicon-pause');
        handlePlay();
      }
      else {
        span.addClass('glyphicon-play');
        span.removeClass('glyphicon-pause');
        handleStop();
      }
    });
//toggleSelectedListener
  $('.pad').click(function() {
    $(this).toggleClass("selected");
  });

};
module.exports = {
  addDrumHandlers,
};
