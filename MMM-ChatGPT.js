const chatgpt = require('chatgpt');

Module.register("MMM-ChatGPT", {
  // Default module config.
  defaults: {
    triggerWord: "",
    maxRecordingTime: 5000, // 5 seconds
    maxDisplayedResults: 1,
    displayDelay: 3000 // 3 seconds
  },

  // Define start sequence.
  start: function() {
    Log.info("Starting module: " + this.name);

    this.sendSocketNotification("CONNECT_TO_API", {
      apiKey: "<your_api_key_here>"
    });

    this.listening = false;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.listening = true;
      this.updateDom();
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.updateDom();
    };

    this.recognition.onresult = async (event) => {
      let question = event.results[0][0].transcript;
      Log.info("User asked: " + question);
      let response = await chatgpt.ask(question, this.config.maxDisplayedResults);
      this.sendSocketNotification("API_RESPONSE", {
        question: question,
        response: response,
      });
    };
  },

  // Override dom generator.
  getDom: function() {
    let wrapper = document.createElement("div");

    // Microphone listening status
    let micStatus = document.createElement("div");
    micStatus.innerHTML = "Microphone: " + (this.listening ? "Listening" : "Not Listening");
    wrapper.appendChild(micStatus);

    return wrapper;
  },

  // Define socket notification received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONNECT_TO_API") {
      chatgpt.init(payload.apiKey);
    } else if (notification === "TRIGGERED") {
      this.recognition.start();
    }
  }
});
