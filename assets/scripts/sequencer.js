'use strict';


//CREATE THE AUDIO BUFFER
let context = new window.AudioContext() || new window.webkitAudioContext();

let kickVolume = 0.8;
let snareVolume = 0.8;
let hihatCloseVolume = 0.8;
let hihatOpenVolume = 0.8;
let clapVolume = 0.8;

//kick drum synthesis
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
  // this.gain.gain.setValueAtTime(0.8, time);
  this.gain.gain.setValueAtTime(kickVolume, time);
  this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  this.osc.start(time);
  // this.osc.stop(time + 0.5);
  this.gain.gain.setTargetAtTime(0, time, 0.5 + 0.015);
};


//snare drum synthesis
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
	this.noiseEnvelope.gain.setValueAtTime(snareVolume, time);
	this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
//jQuery snare drum pitch
	this.osc.frequency.setValueAtTime(100, time);
//jQuery snare drum volume
	this.oscEnvelope.gain.setValueAtTime(snareVolume, time);
	this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  this.osc.start(time);
	this.osc.stop(time + 0.2);

  this.noise.start(time);
	this.noise.stop(time + 0.2);
};


//hihat closed synthesis
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
    this.gain.gain.setValueAtTime(hihatCloseVolume, time);
//jQuery fundamental is the frequency fundamental of the hihat
    this.osc.frequency.value = fundamental * ratios[i];
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    this.osc.start(time);
    this.osc.stop(time + 0.05);
  }
};


//hihat open synthesis
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
    this.gain.gain.setValueAtTime(hihatOpenVolume, time);
//jQuery fundamental is the frequency fundamental of the hihat
    this.osc.frequency.value = fundamental * ratios[i];
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
    this.osc.start(time);
    this.gain.gain.setTargetAtTime(0, time, 0.4 + 0.015);
    this.osc.stop(time + 0.415);
  }
};


//clap synthesis
function Clap(context) {
  this.context = context;
}

Clap.prototype.noiseBuffer = function() {
	let bufferSize = this.context.sampleRate;
	let buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
	let output = buffer.getChannelData(0);

	for (let i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}
	return buffer;
};

Clap.prototype.setup = function() {
  this.noise = this.context.createBufferSource();
  this.noise.buffer = this.noiseBuffer();

  let bandpass = this.context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1600;
  this.noise.connect(bandpass);

  this.lfo = this.context.createOscillator();
  this.lfo.type = 'sawtooth';
  let lfopass = this.context.createBiquadFilter();
  lfopass.type = "highpass";
  lfopass.frequency.value = 2000;
  this.lfo.connect(lfopass);

  this.noiseEnvelope = this.context.createGain();

  bandpass.connect(this.noiseEnvelope);
  lfopass.connect(this.noiseEnvelope);

  this.noiseEnvelope.connect(this.context.destination);
};

Clap.prototype.trigger = function(time) {
    this.setup();

    this.noiseEnvelope.gain.setValueAtTime(clapVolume, time);
    // this.noiseEnvelope.gain.exponentialRampToValueAtTime(clapVolume-0.000001, time + 0.01);
    this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    this.lfo.frequency.setValueAtTime(90.9, time);
    this.lfo.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    this.noise.start(time);
    this.noise.stop(time + 1);

    this.lfo.start(time);
    this.lfo.stop(time + 0.09);
};



//PLAYBACK
const kick = new Kick(context);
const snare = new Snare(context);
const clap = new Clap(context);
const hihatClose = new HiHatClose(context);
const hihatOpen = new HiHatOpen(context);


let compressor;

let noteTime;
let startTime;
let lastDrawTime = -1;
let LOOP_LENGTH = 16;
let rhythmIndex = 0;
let timeoutId;

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
//
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
//
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
//
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






// function initializeAudioNodes() {
//   let finalMixNode;
//   if (context.createDynamicsCompressor) {
//       // Create a dynamics compressor to sweeten the overall mix.
//       compressor = context.createDynamicsCompressor();
//       compressor.connect(context.destination);
//       finalMixNode = compressor;
//   } else {
//       // No compressor available in this implementation.
//       finalMixNode = context.destination;
//   }
//
//
//   // Create master volume.
//   // for now, the master volume is static, but in the future there will be a slider
//   masterGainNode = context.createGain();
//   masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
//   masterGainNode.connect(finalMixNode);
// }


function playNote(instrument, noteTime) {
  instrument.trigger(noteTime);
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
            playNote(clap, contextPlayTime);
            break;
        }
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

function instVolume() {
    let selector;
	$('.volume').change(function(){
    let drumVolume = (this.value) / 125;
    selector = $(this).closest('.inst-wrapper').find('span').attr('id');
    if (selector === 'kick') {
      kickVolume = drumVolume;
    }
    if (selector === 'snare') {
      snareVolume = drumVolume;
    }
    if (selector === 'hihatClose') {
      hihatCloseVolume = drumVolume;
    }
    if (selector === 'hihatOpen') {
      hihatOpenVolume = drumVolume;
    }
    if (selector === 'clap') {
      clapVolume = drumVolume;
    }
	});
	//change volume level after moving
  //I would like to change this to immediate volume change.
	$('.'+selector+'').change();
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
    console.log(tempo);
    if (tempo > TEMPO_MIN) {
      tempo -= TEMPO_STEP;
      $("#tempo-input").val(tempo);
    }
  });
}


$(document).ready(function() {
  instVolume();
  // initializeAudioNodes();
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

  // $('#defaultSlider').change(function(){
  //     instrVolume();
  // })
};
module.exports = {
  addDrumHandlers,
};
