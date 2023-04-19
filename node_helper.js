const NodeHelper = require("node_helper");
const { spawn } = require("child_process");

module.exports = NodeHelper.create({

  start: function() {
    console.log("Starting module: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "TRIGGERED") {
      this.startRecording();
    } else if (notification === "AUDIO") {
      this.playAudioResponse(payload);
    }
  },

  startRecording: function() {
    //Start recording audio
    const arecord = spawn("arecord", ["-D", "plughw:1,0", "-f", "S16_LE", "-r", "16000", "-t", "raw"]);
    const lame = spawn("lame", ["-r", "-s", "16", "-m", "m", "-", "-"]);
    arecord.stdout.pipe(lame.stdin);
    lame.stdout.on("data", data => {
      this.sendSocketNotification("RECORDED", data);
      this.stopRecording(arecord);
    });
  },

  stopRecording: function(arecord) {
    //Stop recording audio
    arecord.kill("SIGINT");
  },

  playAudioResponse: function(audio) {
    //Play audio response through speakers
    const aplay = spawn("aplay");
    aplay.stdin.write(audio);
    aplay.stdin.end();
  },

});
