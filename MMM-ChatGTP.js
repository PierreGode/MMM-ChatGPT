Module.register("MMM-ChatGTP", {
  defaults: {
    apiKey: "",
    triggerWord: ""
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("CONFIG", this.config);
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onstart = () => {
      console.log("Speech recognition started");
    };
    this.recognition.onresult = (event) => {
      let last = event.results.length - 1;
      let transcript = event.results[last][0].transcript.toLowerCase().trim();
      if (transcript.startsWith(this.config.triggerWord)) {
        this.sendSocketNotification("QUESTION", transcript.slice(this.config.triggerWord.length).trim());
      }
    };
    this.recognition.onend = () => {
      console.log("Speech recognition ended");
      this.recognition.start();
    };
    this.recognition.start();
  },

  getDom: function () {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "small";
    this.content = document.createElement("div");
    this.content.className = "bright";
    this.wrapper.appendChild(this.content);
    return this.wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RESPONSE") {
      this.content.innerHTML = "<p>You asked: " + payload.question + "</p>" +
        "<p>The answer is: " + payload.answer + "</p>";
      let audio = new Audio("data:audio/mp3;base64," + payload.audio);
      audio.play();
    }
  }
});
