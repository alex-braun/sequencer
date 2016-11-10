

# drum sequencer

This is a drum sequencer using an implementation of the Web Audio API.  No audio
files are used. All of the sounds are instead created using the API's oscillators,
noise generators, and filters.

Some important notes:

To instantiate a context of the Web Audio API:
```
let context = new window.AudioContext() || new window.webkitAudioContext();
```
Audio sources first need to be created.  In this case, an oscillator is built with
object prototypes.
Then, the source is connected to a gain node with createGain().

```
function Kick(context) {
	this.context = context;
}

Kick.prototype.setup = function() {
  this.osc = this.context.createOscillator();
  this.gain = this.context.createGain();
  this.osc.connect(this.gain);
  this.gain.connect(this.context.destination);
};

```
We then trigger the sine wave oscillator to play at a specific frequency, 150Hz.
the gain level will start at the stated kickVolume variable (via jQuery), and
the frequency drops after 0.5 seconds.
The gain level also ramps down after 0.5 seconds.

Finally, in this particular example, after the oscillator is started with .start(),
it is stopped by ramping down to value '0' in 0.515 seconds, as opposed to stop().  This aviods an audible 'click' sound at the end of the audio playback, which is caused by the audio context ending in the middle of the sine wave's cycle.

```
Kick.prototype.trigger = function(time) {
  this.setup();
  this.osc.frequency.setValueAtTime(150, time);
  this.osc.type = 'sine';
  this.gain.gain.setValueAtTime(kickVolume, time);
  this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

  this.osc.start(time);
  // this.osc.stop(time + 0.5);
  this.gain.gain.setTargetAtTime(0, time, 0.5 + 0.015);
};
```

Thank you to all of the drum machine programmers before me that I have looked at for inspiration, in particular Chris Lowis who made a very helpful and informative
tutorial on the basics of creating osciallators and using them for drum sounds.
https://dev.opera.com/articles/drum-sounds-webaudio/
