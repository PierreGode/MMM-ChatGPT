Module.register("MMM-ChatGTP", {
  // Default module config.
  defaults: {
    apiKey: "",
    triggerWord: "",
    maxRecordingTime: 5000, // 5 seconds
    recognitionLang: "en-US",
    maxDisplayedResults: 1,
    displayDelay: 3000 // 3 seconds
  },

  // Define start sequence.
  start: function() {
    Log.info("Starting module: " + this.name);

    this.sendSocketNotification("CONNECT_TO_API", {
      apiKey: this.config.apiKey
    });

    this.listening = false;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = this.config.recognitionLang;

    this.recognition.onstart = () => {
      this.listening = true;
      this.updateDom();
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.updateDom();
    };

    this.recognition.onresult = (event) => {
      let question = event.results[0][0].transcript;
      Log.info("User asked: " + question);
      this.sendSocketNotification("ASK_API", {
        question: question,
        maxDisplayedResults: this.config.maxDisplayedResults
      });
    };
  },

  // Override dom generator.
  getDom: function() {
    let wrapper = document.createElement("div");

    // API connection status
    let apiStatus = document.createElement("div");
    apiStatus.innerHTML = "API Status: " + (this.connected ? "Connected" : "Disconnected");
    wrapper.appendChild(apiStatus);

    // Microphone listening status
    let micStatus = document.createElement("div");
    micStatus.innerHTML = "Microphone: " + (this.listening ? "Listening" : "Not Listening");
    wrapper.appendChild(micStatus);

    return wrapper;
  },

  // Define socket notification received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === "API_RESPONSE") {
      let questionWrapper = document.createElement("div");
      let question = document.createElement("div");
      let response = document.createElement("div");

      questionWrapper.className = "small";
      question.innerHTML = "You: " + payload.question;
      response.innerHTML = "ChatGPT: " + payload.response;

      questionWrapper.appendChild(question);
      questionWrapper.appendChild(response);
      this.fadeIn(questionWrapper, this.config.displayDelay);

      let audio = new Audio();
      audio.src = "data:audio/wav;base64," + payload.audio;
      audio.play();
    }
  }
});
