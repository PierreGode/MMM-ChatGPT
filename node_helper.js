const NodeHelper = require("node_helper");
const SpeechRecognition = require("speech-recognition");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node helper: " + this.name);
    this.listening = false;
    this.speechRecog = new SpeechRecognition();
    this.speechRecog.setTriggerWords(["magic mirror"]);
    const self = this;
    this.handler = function (transcript) {
      if (transcript.toLowerCase().includes("magic mirror")) {
        self.listening = true;
        self.sendSocketNotification("LISTENING", true);
        self.speechRecog.startListening();
      }
    };
    this.speechRecog.addEventListener("result", function (event) {
      const transcript = event.results[0][0].transcript;
      self.sendSocketNotification("TRANSCRIPT", transcript);
    });
    this.speechRecog.addEventListener("end", function (event) {
      if (self.listening) {
        self.speechRecog.startListening();
      }
    });
    this.speechRecog.addEventListener("error", function (event) {
      console.log("Speech recognition error: ", event.error);
    });
  },
  // Override socketNotificationReceived method.
  socketNotificationReceived: function (notification, payload) {
    if (notification === "LISTENING") {
      this.listening = payload;
      if (this.listening) {
        this.speechRecog.addEventListener("result", this.handler);
        this.speechRecog.startListening();
      } else {
        this.speechRecog.removeEventListener("result", this.handler);
        this.speechRecog.stopListening();
      }
    }
  }
});
