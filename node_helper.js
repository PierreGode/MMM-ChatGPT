const chatgpt = require('chatgpt');
const { spawn } = require("child_process");

module.exports = NodeHelper.create({

  start: function() {
    console.log("Starting module: " + this.name);
  },

  socketNotificationReceived: async function (notification, payload) {
    if (notification === "TRIGGERED") {
      this.startRecording();
    } else if (notification === "RECORDED") {
      let response = await chatgpt.reply(payload);
      this.sendSocketNotification("AUDIO", response.audio);
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
  }
});
